"use client";

import { useState, useEffect } from "react";
import { View, Text } from "@tamagui/core";
import { YStack, XStack } from "@tamagui/stacks";
import { Button, Input, Spinner } from "@repo/ui";
import { Plus, Copy, Trash2, Users, Calendar, Mail } from "lucide-react";
import {
  createInvite,
  getFamilyInvites,
  revokeInvite,
  getUserFamilyMembership,
} from "@/lib/inviteService";
import { getCurrentUser } from "@/lib/auth";
import { sendInviteEmail } from "@/lib/emailService";
import { Invite, InviteFormData } from "@/types/invite";

interface InviteManagerProps {
  familyId: string;
}

export function InviteManager({ familyId }: InviteManagerProps) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<InviteFormData>({
    email: "",
    role: "viewer",
    expiresInDays: 7,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) return;

        // Get user's role in the family
        const membership = await getUserFamilyMembership(currentUser.uid);
        if (membership) {
          setUserRole(membership.role);
        }

        // Load invites
        const familyInvites = await getFamilyInvites(familyId);
        setInvites(familyInvites);
      } catch (err) {
        setError("Failed to load invites");
        console.error("Error loading invites:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [familyId]);

  const handleCreateInvite = async () => {
    if (!formData.role) {
      setError("Please select a role");
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const currentUser = getCurrentUser();
      if (!currentUser) {
        setError("You must be signed in to create invites");
        return;
      }

      const { invite, joinLink } = await createInvite(
        familyId,
        formData,
        currentUser.uid
      );

      setInvites((prev) => [invite, ...prev]);

      // Send email if provided
      if (formData.email && formData.email.trim()) {
        try {
          const emailResult = await sendInviteEmail({
            to: formData.email.trim(),
            familyName: "Your Family", // You might want to get this from family data
            inviterName:
              currentUser.displayName || currentUser.email || "Family Member",
            role: formData.role,
            joinLink,
            expiresAt: invite.expiresAt.toLocaleDateString(),
          });

          if (emailResult.success) {
            setSuccess(
              `Invite created and email sent to ${formData.email}! Share this link: ${joinLink}`
            );
          } else {
            setSuccess(
              `Invite created! Email failed to send: ${emailResult.error}. Share this link: ${joinLink}`
            );
          }
        } catch (emailError) {
          console.error("Email sending error:", emailError);
          setSuccess(
            `Invite created! Email failed to send. Share this link: ${joinLink}`
          );
        }
      } else {
        setSuccess(`Invite created! Share this link: ${joinLink}`);
      }

      setShowForm(false);
      setFormData({ email: "", role: "viewer", expiresInDays: 7 });
    } catch (err) {
      setError("Failed to create invite");
      console.error("Error creating invite:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      await revokeInvite(inviteId);
      setInvites((prev) =>
        prev.map((invite) =>
          invite.id === inviteId
            ? { ...invite, status: "expired" as const }
            : invite
        )
      );
      setSuccess("Invite revoked successfully");
    } catch (err) {
      setError("Failed to revoke invite");
      console.error("Error revoking invite:", err);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess("Link copied to clipboard!");
    } catch (err) {
      setError("Failed to copy link");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "$blue10";
      case "accepted":
        return "$green10";
      case "expired":
        return "$red10";
      default:
        return "$gray10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "accepted":
        return "✅";
      case "expired":
        return "❌";
      default:
        return "❓";
    }
  };

  if (loading) {
    return (
      <View
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$background"
        padding="$4"
      >
        <Spinner size="large" color="$blue10" />
        <Text marginTop="$4" fontSize="$4" color="$color11">
          Loading invites...
        </Text>
      </View>
    );
  }

  // Check if user has permission to manage invites
  if (userRole !== "owner" && userRole !== "editor") {
    return (
      <View
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$background"
        padding="$4"
      >
        <Text fontSize="$4" color="$color11" textAlign="center">
          You don't have permission to manage invites
        </Text>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor="$background" padding="$4">
      <YStack space="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$6" fontWeight="bold" color="$color12">
            Family Invites
          </Text>
          <Button
            onPress={() => setShowForm(!showForm)}
            backgroundColor="$blue10"
            color="white"
            icon={<Plus size={16} />}
          >
            Create Invite
          </Button>
        </XStack>

        {error && (
          <View backgroundColor="$red2" padding="$3" borderRadius="$4">
            <Text color="$red10" fontSize="$3">
              {error}
            </Text>
          </View>
        )}

        {success && (
          <View backgroundColor="$green2" padding="$3" borderRadius="$4">
            <Text color="$green10" fontSize="$3">
              {success}
            </Text>
          </View>
        )}

        {showForm && (
          <View backgroundColor="$gray2" padding="$4" borderRadius="$4">
            <YStack space="$3">
              <Text fontSize="$4" fontWeight="bold" color="$color12">
                Create New Invite
              </Text>

              <YStack space="$2">
                <Text fontSize="$3" color="$color11">
                  Email Address
                </Text>
                <input
                  type="email"
                  placeholder="Enter email address to send invite"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  autoCapitalize="none"
                  autoCorrect="off"
                  style={{
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "16px",
                    width: "100%",
                    backgroundColor: "white",
                    fontFamily: "inherit",
                  }}
                />
                <Text fontSize="$2" color="$color10">
                  Optional - if provided, an email will be sent with the invite
                  link
                </Text>
              </YStack>

              <YStack space="$2">
                <Text fontSize="$3" color="$color11">
                  Role
                </Text>
                <XStack space="$2">
                  {["viewer", "editor", "approver"].map((role) => (
                    <Button
                      key={role}
                      onPress={() =>
                        setFormData((prev) => ({ ...prev, role: role as any }))
                      }
                      variant={formData.role === role ? "default" : "outlined"}
                      backgroundColor={
                        formData.role === role ? "$blue10" : undefined
                      }
                      color={formData.role === role ? "white" : undefined}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Button>
                  ))}
                </XStack>
              </YStack>

              <YStack space="$2">
                <Text fontSize="$3" color="$color11">
                  Expires in (days)
                </Text>
                <input
                  type="number"
                  placeholder="7"
                  value={formData.expiresInDays?.toString()}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      expiresInDays: parseInt(e.target.value) || 7,
                    }))
                  }
                  min="1"
                  max="30"
                  style={{
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "16px",
                    width: "100%",
                    backgroundColor: "white",
                    fontFamily: "inherit",
                  }}
                />
              </YStack>

              <XStack space="$2">
                <Button
                  onPress={handleCreateInvite}
                  disabled={creating}
                  backgroundColor="$green10"
                  color="white"
                  flex={1}
                >
                  {creating ? (
                    <XStack alignItems="center" space="$2">
                      <Spinner size="small" color="white" />
                      <Text color="white">Creating...</Text>
                    </XStack>
                  ) : (
                    "Create Invite"
                  )}
                </Button>
                <Button onPress={() => setShowForm(false)} variant="outlined">
                  Cancel
                </Button>
              </XStack>
            </YStack>
          </View>
        )}

        <YStack space="$3">
          {invites.length === 0 ? (
            <View
              backgroundColor="$gray2"
              padding="$4"
              borderRadius="$4"
              alignItems="center"
            >
              <Users size={32} color="$gray10" />
              <Text fontSize="$4" color="$color11" marginTop="$2">
                No invites created yet
              </Text>
            </View>
          ) : (
            invites.map((invite) => (
              <View
                key={invite.id}
                backgroundColor="$gray2"
                padding="$4"
                borderRadius="$4"
              >
                <XStack justifyContent="space-between" alignItems="flex-start">
                  <YStack space="$2" flex={1}>
                    <XStack alignItems="center" space="$2">
                      <Text fontSize="$4" fontWeight="bold" color="$color12">
                        {invite.role.charAt(0).toUpperCase() +
                          invite.role.slice(1)}
                      </Text>
                      <Text fontSize="$3" color={getStatusColor(invite.status)}>
                        {getStatusIcon(invite.status)} {invite.status}
                      </Text>
                    </XStack>

                    {invite.email && (
                      <XStack alignItems="center" space="$2">
                        <Mail size={14} color="$gray10" />
                        <Text fontSize="$3" color="$color11">
                          {invite.email}
                        </Text>
                      </XStack>
                    )}

                    <XStack alignItems="center" space="$2">
                      <Calendar size={14} color="$gray10" />
                      <Text fontSize="$3" color="$color11">
                        Expires: {invite.expiresAt.toLocaleDateString()}
                      </Text>
                    </XStack>

                    <Text fontSize="$2" color="$color10">
                      Code: {invite.code}
                    </Text>
                  </YStack>

                  <XStack space="$2">
                    <Button
                      onPress={() =>
                        copyToClipboard(
                          `${window.location.origin}/invite?code=${invite.code}`
                        )
                      }
                      variant="outlined"
                      size="small"
                      icon={<Copy size={14} />}
                    >
                      Copy Link
                    </Button>
                    {invite.status === "pending" && !invite.email && (
                      <Button
                        onPress={() => {
                          const email = prompt(
                            "Enter email address to send invite:"
                          );
                          if (email && email.trim()) {
                            // Send email for existing invite
                            sendInviteEmail({
                              to: email.trim(),
                              familyName: "Your Family",
                              inviterName: "Family Member",
                              role: invite.role,
                              joinLink: `${window.location.origin}/invite?code=${invite.code}`,
                              expiresAt: invite.expiresAt.toLocaleDateString(),
                            }).then((result) => {
                              if (result.success) {
                                setSuccess(`Email sent to ${email}!`);
                              } else {
                                setError(
                                  `Failed to send email: ${result.error}`
                                );
                              }
                            });
                          }
                        }}
                        variant="outlined"
                        size="small"
                        icon={<Mail size={14} />}
                        borderColor="$blue10"
                        color="$blue10"
                      >
                        Send Email
                      </Button>
                    )}
                    {invite.status === "pending" && (
                      <Button
                        onPress={() => handleRevokeInvite(invite.id)}
                        variant="outlined"
                        size="small"
                        icon={<Trash2 size={14} />}
                        borderColor="$red10"
                        color="$red10"
                      >
                        Revoke
                      </Button>
                    )}
                  </XStack>
                </XStack>
              </View>
            ))
          )}
        </YStack>
      </YStack>
    </View>
  );
}
