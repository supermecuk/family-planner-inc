"use client";

import { useState, useEffect } from "react";
import { View, Text } from "@tamagui/core";
import { YStack, XStack } from "@tamagui/stacks";
import { Button, Spinner } from "@repo/ui";
import { Users, Settings, Calendar, Plus } from "lucide-react";
import { FamilyDashboard } from "@/components/FamilyDashboard";
import { InviteManager } from "@/components/InviteManager";
import { CreateFamilyForm } from "@/components/CreateFamilyForm";
import { getUserFamilyMembership } from "@/lib/inviteService";
import { getCurrentUser } from "@/lib/auth";

type TabType = "dashboard" | "invites" | "settings";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateFamily, setShowCreateFamily] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          // Redirect to login if not authenticated
          window.location.href = "/";
          return;
        }

        const membership = await getUserFamilyMembership(currentUser.uid);
        if (membership) {
          setUserRole(membership.role);
          setFamilyId(membership.familyId);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  if (loading) {
    return (
      <View
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$background"
      >
        <Spinner size="large" color="$blue10" />
        <Text marginTop="$4" fontSize="$4" color="$color11">
          Loading dashboard...
        </Text>
      </View>
    );
  }

  const handleFamilyCreated = (newFamilyId: string) => {
    setFamilyId(newFamilyId);
    setUserRole("owner");
    setShowCreateFamily(false);
    // Reload user data to get updated membership
    window.location.reload();
  };

  if (!familyId && !showCreateFamily) {
    return (
      <View
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$background"
        padding="$4"
      >
        <YStack alignItems="center" space="$4" maxWidth={400}>
          <Users size={48} color="$gray10" />
          <Text
            fontSize="$6"
            fontWeight="bold"
            color="$color12"
            textAlign="center"
          >
            No Family Found
          </Text>
          <Text fontSize="$4" color="$color11" textAlign="center">
            You are not currently a member of any family. Create your own family
            or ask a family member to send you an invite!
          </Text>
          <XStack space="$2">
            <Button
              onPress={() => setShowCreateFamily(true)}
              backgroundColor="$blue10"
              color="white"
            >
              Create Family
            </Button>
            <Button
              onPress={() => (window.location.href = "/")}
              variant="outlined"
            >
              Go Home
            </Button>
          </XStack>
        </YStack>
      </View>
    );
  }

  if (showCreateFamily) {
    return (
      <CreateFamilyForm
        onFamilyCreated={handleFamilyCreated}
        onCancel={() => setShowCreateFamily(false)}
      />
    );
  }

  const tabs = [
    { id: "dashboard" as TabType, label: "Tasks", icon: Calendar },
    { id: "invites" as TabType, label: "Invites", icon: Users },
    { id: "settings" as TabType, label: "Settings", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <FamilyDashboard />;
      case "invites":
        return <InviteManager familyId={familyId} />;
      case "settings":
        return (
          <View
            flex={1}
            alignItems="center"
            justifyContent="center"
            padding="$4"
          >
            <Text fontSize="$4" color="$color11">
              Settings coming soon...
            </Text>
          </View>
        );
      default:
        return <FamilyDashboard />;
    }
  };

  return (
    <View flex={1} backgroundColor="$background">
      {/* Header */}
      <View
        backgroundColor="$gray2"
        padding="$4"
        borderBottomWidth={1}
        borderBottomColor="$gray6"
      >
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$6" fontWeight="bold" color="$color12">
            Family Planner
          </Text>
          <XStack alignItems="center" space="$2">
            <Text fontSize="$3" color="$color10">
              Role: {userRole}
            </Text>
            <Button
              onPress={() => {
                // Sign out logic here
                window.location.href = "/";
              }}
              variant="outlined"
              size="$3"
            >
              Sign Out
            </Button>
          </XStack>
        </XStack>
      </View>

      {/* Tab Navigation */}
      <View
        backgroundColor="$gray1"
        paddingHorizontal="$4"
        paddingVertical="$2"
      >
        <XStack space="$2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Button
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                variant={isActive ? "default" : "outlined"}
                backgroundColor={isActive ? "$blue10" : undefined}
                color={isActive ? "white" : undefined}
                icon={<Icon size={16} />}
              >
                {tab.label}
              </Button>
            );
          })}
        </XStack>
      </View>

      {/* Content */}
      <View flex={1}>{renderContent()}</View>
    </View>
  );
}
