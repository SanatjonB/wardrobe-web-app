import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 },
      );
    }

    const { error } = await resend.emails.send({
      from: "ClosetIQ Contact <onboarding@resend.dev>",
      to: "sburhanov1977@gmail.com",
      replyTo: email,
      subject: subject?.trim() || `New message from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
          <h2 style="margin:0 0 4px;font-size:20px;color:#0b0b0c;">New Contact Form Submission</h2>
          <p style="margin:0 0 24px;font-size:13px;color:#7a7a84;">Via ClosetIQ contact form</p>

          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #e9e9ee;color:#4a4a52;width:90px;">Name</td>
              <td style="padding:10px 0;border-bottom:1px solid #e9e9ee;color:#0b0b0c;font-weight:600;">${name}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #e9e9ee;color:#4a4a52;">Email</td>
              <td style="padding:10px 0;border-bottom:1px solid #e9e9ee;color:#0b0b0c;font-weight:600;">${email}</td>
            </tr>
            ${
              subject
                ? `<tr>
              <td style="padding:10px 0;border-bottom:1px solid #e9e9ee;color:#4a4a52;">Subject</td>
              <td style="padding:10px 0;border-bottom:1px solid #e9e9ee;color:#0b0b0c;font-weight:600;">${subject}</td>
            </tr>`
                : ""
            }
          </table>

          <div style="margin-top:24px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#4a4a52;">Message</p>
            <div style="background:#f6f6f9;border-radius:10px;padding:16px;font-size:14px;color:#0b0b0c;line-height:1.6;white-space:pre-wrap;">${message}</div>
          </div>

          <p style="margin-top:24px;font-size:12px;color:#7a7a84;">
            Reply directly to this email to respond to ${name}.
          </p>
        </div>
      `,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 },
    );
  }
}
