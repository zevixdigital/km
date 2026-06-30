import { Resend } from 'resend';

// Resend dashboard se free key lekar yahan daalein ya Vercel Environment Variables me set karein
const resend = new Resend(process.env.RESEND_API_KEY || 're_your_free_api_key_here');

export default async function handler(req: any, res: any) {
  // Sirf POST requests allow karne ke liye
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, studentName, id, sport, subSport } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { data, error } = await resend.emails.send({
      from: 'Khelo Mewat <onboarding@resend.dev>', 
      to: [email],
      subject: '🏆 Registration Confirmed - Khelo Mewat 2.0',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #0A1628; padding: 24px; text-align: center; border-bottom: 3px solid #F37022;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 1px;">Khelo Mewat 2.0</h1>
          </div>
          <div style="padding: 24px; background-color: #FFFFFF;">
            <p style="font-size: 16px; color: #0F172A; margin-top: 0;">Dear <strong>${studentName}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.5;">Your registration application for the upcoming tournament has been securely logged into our system infrastructure.</p>
            
            <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #F37022; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Your Enrolment Metrics</h3>
              <p style="margin: 6px 0; font-size: 13px;"><strong>Tracking UID:</strong> <span style="font-family: monospace; color: #F37022; font-weight: bold;">${id}</span></p>
              <p style="margin: 6px 0; font-size: 13px;"><strong>Selected Sport:</strong> ${sport.toUpperCase()}</p>
              <p style="margin: 6px 0; font-size: 13px;"><strong>Event / Division:</strong> ${subSport}</p>
            </div>
            <p style="font-size: 12px; color: #64748B;">Aap is Tracking UID ka use karke website par apna status live verify kar sakte hain.</p>
          </div>
          <div style="background-color: #F8FAFC; padding: 12px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 10px; color: #94A3B8;">
            Official Automated Gateway Dispatch • khelomewat.in
          </div>
        </div>
      `,
    });

    if (error) {
      return res.status(400).json({ error });
    }

    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
