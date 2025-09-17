export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyMember {
  uid: string;
  familyId: string;
  role: "owner" | "editor" | "approver" | "viewer";
  subscriptionType: "base" | "premium";
  joinedAt: Date;
}

export interface Family {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
