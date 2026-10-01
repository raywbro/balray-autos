import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { sellerEmail, sellerName, listingTitle, listingPrice, listingId } = await request.json();

    if (!sellerEmail) {
      return NextResponse.json({ error: "Missing seller email" }, { status: 400 });
    }

    const listingUrl = `https://www.balrayautos.co.za/listing/${listingId}`;

    const { data, error } = await resend.emails.send({
      from: "Balray Autos <noreply@balrayautos.co.za>",
      to: sellerEmail,
      subject: `🎉 Your listing has been approved!`,
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
                    <h1 style="margin:0 0 20px 0;font-size:24px;font-weight:900;color:#34414A;text-align:center;">
                      🎉 Great News, ${sellerName}!
                    </h1>
                    
                    <p style="margin:0 0 20px 0;font-size:15px;line-height:24px;color:#4A5962;text-align:center;">
                      Your listing has been <strong>approved</strong> and is now live on the Balray Autos marketplace.
                    </p>

                    <div style="background-color:#FBF7EC;border:1px solid #D3B86A;border-radius:12px;padding:20px;margin:25px 0;text-align:center;">
                      <div style="font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.14em;color:#9A7B37;margin-bottom:8px;">Your Listing</div>
                      <div style="font-size:18px;font-weight:900;color:#34414A;margin-bottom:6px;">${listingTitle}</div>
                      <div style="font-size:22px;font-weight:900;color:#9A7B37;">${listingPrice}</div>
                    </div>
                    
                    <div style="text-align:center;margin:35px 0;">
                      <a href="${listingUrl}" style="display:inline-block;padding:16px 40px;background-color:#B08D3C;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:bold;font-size:15px;">
                        View Your Live Listing
                      </a>
                    </div>

                    <p style="margin:0;font-size:14px;line-height:22px;color:#4A5962;text-align:center;">
                      Buyers can now find and contact you directly. We'll notify you if anyone reaches out.
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color:#F7F8F9;padding:24px 30px;text-align:center;border-top:1px solid #D5DBDF;">
                    <p style="margin:0 0 8px 0;font-size:13px;font-weight:bold;color:#34414A;">
                      Balray Autos
                    </p>
                    <p style="margin:0 0 8px 0;font-size:12px;color:#7A858C;">
                      South African Automotive Marketplace
                    </p>
                    <p style="margin:0;font-size:11px;color:#89939A;">
                      You received this email because you listed a vehicle on Balray Autos.
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
    console.error("Approval email error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}