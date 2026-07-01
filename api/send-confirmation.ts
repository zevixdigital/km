import { Resend } from 'resend';

// 1. Resend dashboard se mili hui asli key (jo re_ se shuru hoti hai) yahan daalein
const resend = new Resend('re_2Gab3kqx_6Uv55S7hPN9EDXYBP8Hxiv3o');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, studentName, id, sport, subSport } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // 2. Sahi method emails.send hai na ki apiKeys.remove
    const { data, error } = await resend.emails.send({
      from: 'Khelo Mewat <onboarding@resend.dev>', // Jab tak domain verify na ho, ise onboarding@resend.dev hi rehne dein
      to: [email], // Testing ke waqt yahan wahi email daalna jisse Resend account banaya hai
      subject: '🏆 Registration Confirmed - Khelo Mewat 2.0',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #0A1628; padding: 24px; text-align: center; border-bottom: 3px solid #F37022;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 1px;">Khelo Mewat 2.0</h1>
          </div>
          <div style="padding: 24px; background-color: #FFFFFF;">
            <p style="font-size: 16px; color: #0F172A; margin-top: 0;">Dear <strong>${studentName}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.5;">Your registration application for the upcoming tournament has been securely logged.</p>
            
            <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 6px 0; font-size: 13px;"><strong>Tracking UID:</strong> <span style="font-family: monospace; color: #F37022; font-weight: bold;">${id}</span></p>
              <p style="margin: 6px 0; font-size: 13px;"><strong>Sport Discipline:</strong> ${sport.toUpperCase()}</p>
              <p style="margin: 6px 0; font-size: 13px;"><strong>Division Category:</strong> ${subSport}</p>
            </div>
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
