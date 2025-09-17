import { View, Text } from "@tamagui/core";
import { Button } from "@repo/ui";
import { XStack, YStack } from "@tamagui/stacks";
import { Task } from "@/types/task";

interface TaskViewProps {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: Task["status"]) => void;
}

export function TaskView({ task, onStatusChange }: TaskViewProps) {
  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return "$orange10";
      case "in-progress":
        return "$blue10";
      case "completed":
        return "$green10";
      case "approved":
        return "$purple10";
      default:
        return "$gray10";
    }
  };

  const getStatusText = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "approved":
        return "Approved";
      default:
        return status;
    }
  };

  return (
    <View
      elevate
      size="$4"
      bordered
      backgroundColor="$background"
      borderRadius="$6"
      padding="$4"
      marginBottom="$3"
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={8}
    >
      <YStack space="$3">
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack flex={1} marginRight="$3">
            <Text
              fontSize="$5"
              fontWeight="600"
              color="$color"
              numberOfLines={2}
            >
              {task.title}
            </Text>
            <Text
              fontSize="$3"
              color="$color11"
              marginTop="$1"
              numberOfLines={2}
            >
              {task.description}
            </Text>
          </YStack>

          {/* Status Badge */}
          <View
            backgroundColor={getStatusColor(task.status)}
            paddingHorizontal="$3"
            paddingVertical="$1.5"
            borderRadius="$10"
          >
            <Text fontSize="$2" color="white" fontWeight="500">
              {getStatusText(task.status)}
            </Text>
          </View>
        </XStack>

        {/* Assignee and Creator */}
        <XStack space="$3" alignItems="center">
          <View
            width={32}
            height={32}
            borderRadius="$10"
            backgroundColor={task.assigneeColor || "$blue8"}
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="$3" color="white" fontWeight="600">
              {task.assigneeId.charAt(0).toUpperCase()}
            </Text>
          </View>
          <YStack flex={1}>
            <Text fontSize="$3" color="$color" fontWeight="500">
              Assigned to: {task.assigneeId}
            </Text>
            <Text fontSize="$2" color="$color11">
              Created by: {task.creatorId}
            </Text>
          </YStack>
        </XStack>

        {/* Deadline */}
        <Text fontSize="$3" color="$color11">
          Due: {new Date(task.deadline).toLocaleDateString()}
        </Text>

        {/* Action Buttons */}
        {task.status !== "approved" && onStatusChange && (
          <XStack space="$2" marginTop="$2">
            {task.status === "pending" && (
              <Button
                size="$3"
                backgroundColor="$blue10"
                color="white"
                borderRadius="$4"
                flex={1}
                onPress={() => onStatusChange(task.id, "in-progress")}
              >
                Start
              </Button>
            )}
            {task.status === "in-progress" && (
              <Button
                size="$3"
                backgroundColor="$green10"
                color="white"
                borderRadius="$4"
                flex={1}
                onPress={() => onStatusChange(task.id, "completed")}
              >
                Complete
              </Button>
            )}
            {task.status === "completed" && (
              <Button
                size="$3"
                backgroundColor="$purple10"
                color="white"
                borderRadius="$4"
                flex={1}
                onPress={() => onStatusChange(task.id, "approved")}
              >
                Approve
              </Button>
            )}
          </XStack>
        )}
      </YStack>
    </View>
  );
}
