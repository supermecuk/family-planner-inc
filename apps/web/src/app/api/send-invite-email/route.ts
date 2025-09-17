import { NextRequest, NextResponse } from "next/server";
import {
  InviteEmailData,
  generateInviteEmailContent,
} from "@/lib/emailService";

export async function POST(request: NextRequest) {
  try {
    const emailData: InviteEmailData = await request.json();

    // Validate required fields
    if (!emailData.to || !emailData.familyName || !emailData.joinLink) {
      return NextResponse.json(
        { error: "Missing required email data" },
        { status: 400 }
      );
    }

    // Generate email content
    const emailContent = generateInviteEmailContent(emailData);

    // For development/testing, we'll just log the email content
    // In production, you would integrate with an email service like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Nodemailer with SMTP

    console.log("=== INVITE EMAIL ===");
    console.log("To:", emailData.to);
    console.log("Subject:", emailContent.subject);
    console.log("HTML Content:", emailContent.html);
    console.log("==================");

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real implementation, you would send the email here:
    // await emailService.send({
    //   to: emailData.to,
    //   subject: emailContent.subject,
    //   html: emailContent.html,
    //   text: emailContent.text,
    // });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully (simulated)",
    });
  } catch (error) {
    console.error("Error in send-invite-email API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
