import { supabase } from './supabase';
import { smtpService } from './smtpService';
import { notificationService } from './notificationService';
// Simple hash function for browser compatibility
const simpleHash = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'effisphere_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const verifyHash = async (password: string, hash: string): Promise<boolean> => {
  const newHash = await simpleHash(password);
  return newHash === hash;
};

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'employee';
  employee?: {
    id: string;
    full_name: string;
    employee_id: string;
    department: string;
    position: string;
  };
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  requiresVerification?: boolean;
}

export interface AdminSignupData {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  companySize: string;
  industry: string;
  phone: string;
  country: string;
}

class AuthService {
  private currentUser: User | null = null;
  private sessionToken: string | null = null;

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Get user from database
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, role, password_hash, is_verified')
        .eq('email', email)
        .eq('is_active', true)
        .single();
        
      if (userError || !user) {
        return { success: false, error: 'Invalid credentials' };
      }
      
      // Get employee data if exists
      const { data: employee } = await supabase
        .from('employees')
        .select('id, full_name, employee_id, department, position')
        .eq('user_id', user.id)
        .single();

      // Verify password
      const isValidPassword = await verifyHash(password, user.password_hash);
      if (!isValidPassword) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Check if admin is verified
      if (user.role === 'admin' && !user.is_verified) {
        return { success: false, error: 'Please verify your email before logging in' };
      }

      // Create session
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const { error: sessionError } = await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString()
        });

      if (sessionError) {
        return { success: false, error: 'Failed to create session' };
      }

      // Update last login
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id);

      // Set current user
      this.currentUser = {
        id: user.id,
        email: user.email,
        role: user.role,
        employee: employee || undefined
      };
      this.sessionToken = sessionToken;

      // Store in localStorage
      localStorage.setItem('auth_token', sessionToken);
      localStorage.setItem('user', JSON.stringify(this.currentUser));

      notificationService.success(
        'Welcome Back!', 
        `Logged in as ${employee?.full_name || user.email}`
      );

      return { success: true, user: this.currentUser };
    } catch (error) {
      notificationService.error('Login Failed', 'Invalid email or password');
      return { success: false, error: 'Login failed' };
    }
  }

  async adminSignup(signupData: AdminSignupData): Promise<AuthResponse> {
    try {
      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store verification code
      const { error: codeError } = await supabase
        .from('verification_codes')
        .insert({
          email: signupData.email,
          code: verificationCode,
          type: 'signup',
          expires_at: expiresAt.toISOString()
        });

      if (codeError) {
        return { success: false, error: 'Failed to send verification code' };
      }

      // Hash password
      const passwordHash = await simpleHash(signupData.password);
      const verificationToken = this.generateSessionToken();

      // Create user (unverified)
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          email: signupData.email,
          password_hash: passwordHash,
          role: 'admin',
          is_verified: false,
          verification_token: verificationToken,
          verification_expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (userError) {
        if (userError.code === '23505') {
          return { success: false, error: 'Email already exists' };
        }
        return { success: false, error: 'Failed to create account' };
      }

      // Create admin profile
      await supabase
        .from('admin_profiles')
        .insert({
          user_id: user.id,
          full_name: signupData.fullName,
          company_name: signupData.companyName,
          company_size: signupData.companySize,
          industry: signupData.industry,
          phone: signupData.phone,
          country: signupData.country
        });

      // Send verification email
      const emailResult = await smtpService.sendVerificationEmail({
        to_email: signupData.email,
        to_name: signupData.fullName,
        verification_code: verificationCode,
        company_name: signupData.companyName
      });

      if (!emailResult.success) {
        // Clean up if email failed
        await supabase.from('users').delete().eq('id', user.id);
        await supabase.from('verification_codes').delete().eq('email', signupData.email);
        return { success: false, error: 'Failed to send verification email. Please try again.' };
      }
      
      return { 
        success: true, 
        requiresVerification: true,
        error: `Demo Mode: Your verification code is ${verificationCode}. Check console for details.` 
      };
    } catch (error) {
      return { success: false, error: 'Signup failed' };
    }
  }

  async verifyEmail(email: string, code: string): Promise<AuthResponse> {
    try {
      // Check verification code
      const { data: verification, error: verifyError } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .eq('type', 'signup')
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (verifyError || !verification) {
        return { success: false, error: 'Invalid or expired verification code' };
      }

      // Mark code as used
      await supabase
        .from('verification_codes')
        .update({ is_used: true })
        .eq('id', verification.id);

      // Verify user
      await supabase
        .from('users')
        .update({ 
          is_verified: true,
          verification_token: null,
          verification_expires_at: null
        })
        .eq('email', email);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Verification failed' };
    }
  }

  async logout(): Promise<void> {
    if (this.sessionToken) {
      await supabase
        .from('user_sessions')
        .delete()
        .eq('session_token', this.sessionToken);
    }

    this.currentUser = null;
    this.sessionToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    notificationService.info('Logged Out', 'You have been successfully logged out');
  }

  async validateSession(): Promise<boolean> {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;

    try {
      const { data: session } = await supabase
        .from('user_sessions')
        .select('user_id, expires_at')
        .eq('session_token', token)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (session) {
        const userData = localStorage.getItem('user');
        if (userData) {
          this.currentUser = JSON.parse(userData);
          this.sessionToken = token;
          return true;
        }
      }
    } catch (error) {
      console.error('Session validation failed:', error);
    }

    return false;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  private generateSessionToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

export const authService = new AuthService();