import { validateEmail } from "@repo/shared/utils/validation";

export interface InviteEmailData {
  to: string;
  familyName: string;
  inviterName: string;
  role: string;
  joinLink: string;
  expiresAt: string;
}

/**
 * Check for pending invitations for a user after sign-in
 */
export const checkPendingInvitations = async (
  userEmail: string
): Promise<{
  hasInvitations: boolean;
  invitations: Array<{
    id: string;
    familyName: string;
    role: string;
    expiresAt: Date;
    inviterName: string;
  }>;
}> => {
  try {
    // For now, we'll simulate checking for invitations
    // In a real implementation, you would query Firestore for invites with this email

    console.log(`Checking for pending invitations for: ${userEmail}`);

    // Simulate API call to check invitations
    const response = await fetch("/api/check-invitations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: userEmail }),
    });

    if (!response.ok) {
      console.error("Failed to check invitations");
      return { hasInvitations: false, invitations: [] };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error checking invitations:", error);
    return { hasInvitations: false, invitations: [] };
  }
};

/**
 * Send an invite email (kept for backward compatibility)
 */
export const sendInviteEmail = async (
  emailData: InviteEmailData
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Validate email
    if (!validateEmail(emailData.to)) {
      return { success: false, error: "Invalid email address" };
    }

    // For now, we'll use a simple approach with a Next.js API route
    // In production, you might want to use a service like SendGrid, Mailgun, or AWS SES
    const response = await fetch("/api/send-invite-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || "Failed to send email",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending invite email:", error);
    return { success: false, error: "Network error while sending email" };
  }
};

/**
 * Generate email content for invite
 */
export const generateInviteEmailContent = (emailData: InviteEmailData) => {
  const { familyName, inviterName, role, joinLink, expiresAt } = emailData;

  return {
    subject: `You're invited to join ${familyName} family!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">You're invited to join ${familyName}!</h2>
        
        <p>Hello!</p>
        
        <p><strong>${inviterName}</strong> has invited you to join the <strong>${familyName}</strong> family on Family Planner.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e293b;">Invitation Details:</h3>
          <ul style="margin: 10px 0;">
            <li><strong>Family:</strong> ${familyName}</li>
            <li><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</li>
            <li><strong>Expires:</strong> ${expiresAt}</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${joinLink}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; font-weight: bold;
                    display: inline-block;">
            Accept Invitation
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${joinLink}" style="color: #2563eb;">${joinLink}</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        
        <p style="color: #64748b; font-size: 12px;">
          This invitation was sent by ${inviterName}. If you didn't expect this invitation, 
          you can safely ignore this email.
        </p>
      </div>
    `,
    text: `
You're invited to join ${familyName}!

${inviterName} has invited you to join the ${familyName} family on Family Planner.

Invitation Details:
- Family: ${familyName}
- Role: ${role.charAt(0).toUpperCase() + role.slice(1)}
- Expires: ${expiresAt}

Accept your invitation: ${joinLink}

If you didn't expect this invitation, you can safely ignore this email.
    `.trim(),
  };
};
