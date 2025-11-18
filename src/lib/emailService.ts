interface EmailData {
  to_email: string;
  to_name: string;
  verification_code: string;
  company_name: string;
}

class EmailService {
  async sendVerificationEmail(emailData: EmailData): Promise<boolean> {
    try {
      // Send verification email directly to user using EmailJS
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: 'service_gmail_effisphere',
          template_id: 'template_admin_verification',
          user_id: 'effisphere_public_key',
          template_params: {
            to_email: emailData.to_email,
            to_name: emailData.to_name,
            verification_code: emailData.verification_code,
            company_name: emailData.company_name,
            from_email: 'aatinshay@gmail.com',
            from_name: 'EffiSphere Team',
            reply_to: 'aatinshay@gmail.com'
          }
        })
      });

      if (response.ok) {
        console.log(`✅ Verification email sent to ${emailData.to_email}`);
        return true;
      } else {
        throw new Error('EmailJS service failed');
      }
    } catch (error) {
      console.error('❌ Primary email service failed:', error);
      
      // Fallback: Use Formspree to send email
      try {
        const fallbackResponse = await fetch('https://formspree.io/f/xdkogkqr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: emailData.to_email,
            _replyto: 'aatinshay@gmail.com',
            _subject: 'EffiSphere Admin Verification Code',
            message: `
Hello ${emailData.to_name},

Welcome to EffiSphere! Please use the verification code below to complete your admin account setup:

🔐 VERIFICATION CODE: ${emailData.verification_code}

This code will expire in 15 minutes for security purposes.

Company: ${emailData.company_name}
Email: ${emailData.to_email}

If you didn't request this verification, please ignore this email.

Best regards,
EffiSphere Team
aatinshay@gmail.com
            `
          })
        });

        if (fallbackResponse.ok) {
          console.log(`✅ Fallback email sent to ${emailData.to_email}`);
          return true;
        } else {
          throw new Error('Fallback email failed');
        }
      } catch (fallbackError) {
        console.error('❌ All email services failed:', fallbackError);
        
        // Final fallback: Log for manual sending
        console.log(`
🔐 MANUAL VERIFICATION REQUIRED:
📧 Send to: ${emailData.to_email}
👤 Name: ${emailData.to_name}
🏢 Company: ${emailData.company_name}
🔢 Code: ${emailData.verification_code}
⏰ Expires: 15 minutes
`);
        
        return false; // Return false in production
      }
    }
  }
}

export const emailService = new EmailService();

// Email Flow: FROM aatinshay@gmail.com TO user's signup email
// Production alternatives:
// - SendGrid API with verified sender
// - Mailgun with custom domain
// - AWS SES with verified email
// - Nodemailer with Gmail App Password