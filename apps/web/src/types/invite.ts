export interface Invite {
  id: string;
  familyId: string;
  email?: string;
  role: "viewer" | "editor" | "approver";
  status: "pending" | "accepted" | "expired";
  code: string; // UUID
  expiresAt: Date;
  createdAt: Date;
  createdBy: string; // User ID who created the invite
}

export interface InviteFormData {
  email?: string;
  role: "viewer" | "editor" | "approver";
  expiresInDays?: number; // Default to 7 days
}
