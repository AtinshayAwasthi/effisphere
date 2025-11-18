interface EmailData {
  to_email: string;
  to_name: string;
  verification_code: string;
  company_name: string;
}

class SMTPService {
  async sendVerificationEmail(emailData: EmailData): Promise<{ success: boolean; code?: string }> {
    // For demo purposes: simulate email sending
    console.log(`
📧 SIMULATED EMAIL TO: ${emailData.to_email}
👤 NAME: ${emailData.to_name}
🏢 COMPANY: ${emailData.company_name}
🔢 VERIFICATION CODE: ${emailData.verification_code}
⏰ EXPIRES: 15 minutes
`);
    
    // Simulate email delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, code: emailData.verification_code };
  }
}

export const smtpService = new SMTPService();

// DEMO MODE: Shows verification code in console and returns it
// For production: Replace with real email service like:
// - EmailJS with proper Gmail setup
// - SendGrid API
// - Mailgun API
// - AWS SES