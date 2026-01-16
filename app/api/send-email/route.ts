import { NextResponse } from "next/server";
import { z } from "zod";

const SendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = SendEmailSchema.safeParse(body);

    if (!parsed.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Invalid request body",
          details: parsed.error.format(),
        }),
        {
          status: 400,
          headers: { "content-type": "application/json" },
        }
      );
    }

    const { to, subject, body } = parsed.data;

    // In a real application, you would integrate with an email service here (e.g., SendGrid, Mailgun)
    // For this example, we'll just log the email details and return a success message.
    console.log("--- Sending Email ---");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    console.log("---------------------");

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: `Email sent successfully to ${to} with subject "${subject}". (Simulation)`,
    });
  } catch (e: any) {
    console.error("Error sending email:", e);
    return new NextResponse(
      JSON.stringify({
        error: e.message || "Internal Server Error",
        success: false,
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      }
    );
  }
}
