import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to_email, to_name, password, department, position } = await req.json();

    const emailHtml = `
      <div style="font-family: Arial; max-width: 600px; margin: auto; padding: 20px;">
        <h1 style="color:#3B82F6;">EffiSphere</h1>
        <p>Hello ${to_name},</p>
        <p>Welcome to EffiSphere! Your employee account has been created.</p>
        
        <div style="background:#F3F4F6; padding:20px; border-radius:8px; margin:20px 0;">
          <h3>Your Login Details:</h3>
          <p><strong>Email:</strong> ${to_email}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p><strong>Department:</strong> ${department}</p>
          <p><strong>Position:</strong> ${position}</p>
        </div>
        
        <p>Please login to access your dashboard and start tracking your work.</p>
        <p><strong>Important:</strong> Please change your password after first login.</p>
        
        
        <p>Regards,<br>EffiSphere Team<br>aatinshay@gmail.com</p>
      </div>
    `;

    // Use same email service as admin verification
    try {
      const emailRes = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: "service_gmail",
          template_id: "template_employee_credentials",
          user_id: "user_effisphere_key",
          template_params: {
            to_email,
            to_name,
            password,
            department,
            position,
            message: emailHtml,
            from_name: "EffiSphere Team",
            reply_to: "aatinshay@gmail.com",
          },
        }),
      });

      if (emailRes.ok) {
        console.log(`✅ Employee credentials sent to: ${to_email}`);
      } else {
        throw new Error("EmailJS failed");
      }
    } catch (error) {
      console.log(`📧 EMPLOYEE CREDENTIALS FOR ${to_email}:
👤 Name: ${to_name}
🔑 Password: ${password}
🏢 Department: ${department}
💼 Position: ${position}

Please manually send these credentials to the employee.`);
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Credentials sent" }),
      { headers: corsHeaders }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});