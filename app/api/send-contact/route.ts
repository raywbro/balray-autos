import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: "Balray Autos Website <noreply@balrayautos.co.za>",
      to: "balrayautos@gmail.com",
      replyTo: email,
      subject: `📩 New Contact: ${subject || "General Enquiry"}`,
      html: `
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F8F9;padding:40px 20px;font-family:Arial,Helvetica,sans-serif;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #D5DBDF;max-width:600px;">
                
                <tr>
                  <td align="center" style="background-color:#34414A;padding:30px 20px;">
                    <img src="https://balray-autos.vercel.app/balray-autos-logo.png" alt="Balray Autos" width="200" style="display:block;max-width:200px;height:auto;">
                  </td>
                </tr>
                
                <tr>
                  <td style="height:4px;background-color:#B08D3C;"></td>
                </tr>
                
                <tr>
                  <td style="padding:40px 30px;">
                    <h1 style="margin:0 0 10px 0;font-size:22px;font-weight:900;color:#34414A;">
                      📩 New Contact Form Submission
                    </h1>
                    <p style="margin:0 0 25px 0;font-size:13px;color:#89939A;">
                      Someone filled out the contact form on your website.
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #E1E5E8;">
                          <div style="font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.14em;color:#9A7B37;margin-bottom:4px;">Name</div>
                          <div style="font-size:15px;font-weight:bold;color:#34414A;">${name}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #E1E5E8;">
                          <div style="font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.14em;color:#9A7B37;margin-bottom:4px;">Email</div>
                          <div style="font-size:15px;color:#34414A;"><a href="mailto:${email}" style="color:#B08D3C;text-decoration:none;">${email}</a></div>
                        </td>
                      </tr>
                      ${phone ? `
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #E1E5E8;">
                          <div style="font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.14em;color:#9A7B37;margin-bottom:4px;">Phone</div>
                          <div style="font-size:15px;color:#34414A;"><a href="tel:${phone}" style="color:#B08D3C;text-decoration:none;">${phone}</a></div>
                        </td>
                      </tr>
                      ` : ""}
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #E1E5E8;">
                          <div style="font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.14em;color:#9A7B37;margin-bottom:4px;">Subject</div>
                          <div style="font-size:15px;font-weight:bold;color:#34414A;">${subject || "General Enquiry"}</div>
                        </td>
                      </tr>
                    </table>

                    <div style="margin-top:25px;padding:20px;background-color:#F7F8F9;border-radius:12px;border:1px solid #E1E5E8;">
                      <div style="font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.14em;color:#9A7B37;margin-bottom:8px;">Message</div>
                      <div style="font-size:14px;line-height:22px;color:#4A5962;white-space:pre-wrap;">${message}</div>
                    </div>

                    <div style="text-align:center;margin-top:30px;">
                      <a href="mailto:${email}" style="display:inline-block;padding:14px 35px;background-color:#B08D3C;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:bold;font-size:14px;">
                        Reply to ${name}
                      </a>
                    </div>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color:#F7F8F9;padding:20px 30px;text-align:center;border-top:1px solid #D5DBDF;">
                    <p style="margin:0;font-size:11px;color:#89939A;">
                      Received via balrayautos.co.za contact form
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Contact email error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}