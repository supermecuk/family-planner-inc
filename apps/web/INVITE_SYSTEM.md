# Family Invite System Implementation

This document describes the implementation of the invite system for the Family Planner application.

## Overview

The invite system allows family owners and editors to invite new users to join their family via unique links. The system includes comprehensive error handling, security rules, and a user-friendly interface.

## Features Implemented

### 1. Invite Creation

- **UUID Generation**: Each invite gets a unique UUID code
- **Role Assignment**: Invites can assign roles (viewer, editor, approver)
- **Expiration**: Invites expire after a configurable number of days (default: 7)
- **Email Optional**: Email addresses are optional for invites
- **Join Links**: Generated in format `https://yourapp.com/invite?code=<UUID>`

### 2. Invite Redemption

- **Authentication Check**: Redirects unauthenticated users to login
- **Validation**: Checks invite status and expiration
- **Family Attachment**: Adds user to family with specified role
- **Duplicate Prevention**: Prevents users from joining the same family twice

### 3. Error Handling

- **Comprehensive Error Types**: Custom error classes for different scenarios
- **User-Friendly Messages**: Clear error messages for end users
- **Logging**: Detailed error logging for debugging
- **Retry Logic**: Exponential backoff for network operations

### 4. Security

- **Firestore Rules**: Comprehensive security rules for all collections
- **Permission System**: Role-based access control
- **Data Validation**: Server-side validation of all operations

## File Structure

```
apps/web/src/
├── types/
│   └── invite.ts                 # Invite-related TypeScript interfaces
├── lib/
│   ├── inviteService.ts          # Core invite functionality
│   ├── errorHandling.ts          # Error handling utilities
│   └── permissions.ts            # Permission checking utilities
├── components/
│   └── InviteManager.tsx         # UI for managing invites
├── app/
│   ├── invite/
│   │   └── page.tsx             # Invite redemption page
│   └── dashboard/
│       └── page.tsx             # Main dashboard with invite management
└── firestore.rules              # Firestore security rules
```

## Database Schema

### Invites Collection

```typescript
{
  id: string;
  familyId: string;
  email?: string;
  role: "viewer" | "editor" | "approver";
  status: "pending" | "accepted" | "expired";
  code: string; // UUID
  expiresAt: Date;
  createdAt: Date;
  createdBy: string; // User ID
}
```

### Users Collection (Family Membership)

```typescript
{
  uid: string;
  familyId: string;
  role: "owner" | "editor" | "approver" | "viewer";
  subscriptionType: "base" | "premium";
  joinedAt: Date;
}
```

## API Functions

### Invite Service (`inviteService.ts`)

#### `createInvite(familyId, inviteData, createdBy)`

Creates a new invite and returns the invite object and join link.

#### `getInviteByCode(code)`

Retrieves an invite by its UUID code.

#### `validateInvite(invite)`

Validates an invite (checks status and expiration).

#### `acceptInvite(inviteCode, userId, userEmail)`

Accepts an invite and adds the user to the family.

#### `getFamilyInvites(familyId)`

Gets all invites for a specific family.

#### `revokeInvite(inviteId)`

Revokes an invite by setting its status to expired.

#### `getUserFamilyMembership(userId)`

Gets a user's family membership information.

## Usage Examples

### Creating an Invite

```typescript
import { createInvite } from "@/lib/inviteService";

const { invite, joinLink } = await createInvite(
  "family-123",
  {
    email: "user@example.com", // optional
    role: "editor",
    expiresInDays: 7,
  },
  "current-user-id"
);

console.log("Share this link:", joinLink);
```

### Accepting an Invite

```typescript
import { acceptInvite } from "@/lib/inviteService";

const result = await acceptInvite(
  "invite-code-uuid",
  "user-id",
  "user@example.com"
);

if (result.success) {
  console.log("Successfully joined family!");
} else {
  console.error("Error:", result.error);
}
```

## Security Rules

The Firestore security rules ensure:

1. **Users Collection**: Users can only read/update their own membership data
2. **Invites Collection**: Only family owners/editors can create invites; anyone can read for redemption
3. **Families Collection**: Only family members can read family data; only owners can update
4. **Tasks Collection**: Role-based access to task operations

## Error Handling

The system includes comprehensive error handling:

- **Custom Error Classes**: `InviteError`, `ValidationError`, `PermissionError`
- **Error Codes**: Standardized error codes for different scenarios
- **User-Friendly Messages**: Clear error messages for end users
- **Logging**: Detailed error logging for debugging
- **Retry Logic**: Automatic retry with exponential backoff

## Role Permissions

- **Owner**: Full access to all features
- **Editor**: Can create/edit tasks and manage invites
- **Approver**: Can approve tasks
- **Viewer**: Can only view tasks

## Testing the System

1. **Create a Family**: Use the dashboard to create a family
2. **Create Invites**: Use the Invite Manager to create invites
3. **Test Redemption**: Use the generated invite links to test the redemption flow
4. **Test Error Cases**: Try expired invites, invalid codes, etc.

## Future Enhancements

- **Email Notifications**: Send email notifications for invites
- **Bulk Invites**: Invite multiple users at once
- **Invite Templates**: Predefined invite templates
- **Analytics**: Track invite usage and conversion rates
- **Custom Expiration**: More granular expiration settings
