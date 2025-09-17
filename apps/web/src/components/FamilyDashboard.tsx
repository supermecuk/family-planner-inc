"use client";

import { useState, useEffect } from "react";
import { View, Text } from "@tamagui/core";
import { YStack, XStack } from "@tamagui/stacks";
import { Button, Spinner } from "@repo/ui";
import { Plus, Users, Calendar, CheckCircle } from "lucide-react";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Task, TaskFormData } from "@/types/task";
import { TaskView } from "./TaskCard";
import { AddTaskModal } from "./AddTaskModal";

export function FamilyDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTask, setAddingTask] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Listen to tasks from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "tasks"),
      (snapshot) => {
        const tasksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];

        setTasks(
          tasksData.sort(
            (a, b) =>
              new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          )
        );
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching tasks:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddTask = async (taskData: TaskFormData) => {
    setAddingTask(true);
    try {
      const newTask: Omit<Task, "id"> = {
        ...taskData,
        creatorId: "CurrentUser", // Replace with actual user ID
        creatorColor: "#3B82F6", // Replace with actual user color
        approverId: "",
        status: "pending",
      };

      await addDoc(collection(db, "tasks"), newTask);
    } catch (error) {
      console.error("Error adding task:", error);
      throw error;
    } finally {
      setAddingTask(false);
    }
  };

  const handleStatusChange = async (
    taskId: string,
    newStatus: Task["status"]
  ) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), {
        status: newStatus,
        ...(newStatus === "approved" && { approverId: "CurrentUser" }), // Replace with actual user ID
      });
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const getTaskStats = () => {
    const pending = tasks.filter((t) => t.status === "pending").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const approved = tasks.filter((t) => t.status === "approved").length;

    return { pending, inProgress, completed, approved };
  };

  const stats = getTaskStats();

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
          Loading tasks...
        </Text>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor="$background">
      {/* Header */}
      <View
        backgroundColor="$blue10"
        paddingTop="$8"
        paddingBottom="$4"
        paddingHorizontal="$4"
        borderBottomLeftRadius="$6"
        borderBottomRightRadius="$6"
      >
        <YStack space="$3">
          <XStack alignItems="center" justifyContent="space-between">
            <Text fontSize="$7" fontWeight="bold" color="white">
              Family Tasks
            </Text>
            <View
              backgroundColor="rgba(255,255,255,0.2)"
              padding="$2"
              borderRadius="$3"
            >
              <Users size={24} color="white" />
            </View>
          </XStack>

          {/* Stats */}
          <XStack space="$3" justifyContent="space-between">
            <View alignItems="center">
              <Text fontSize="$5" fontWeight="bold" color="white">
                {stats.pending}
              </Text>
              <Text fontSize="$2" color="rgba(255,255,255,0.8)">
                Pending
              </Text>
            </View>
            <View alignItems="center">
              <Text fontSize="$5" fontWeight="bold" color="white">
                {stats.inProgress}
              </Text>
              <Text fontSize="$2" color="rgba(255,255,255,0.8)">
                In Progress
              </Text>
            </View>
            <View alignItems="center">
              <Text fontSize="$5" fontWeight="bold" color="white">
                {stats.completed}
              </Text>
              <Text fontSize="$2" color="rgba(255,255,255,0.8)">
                Completed
              </Text>
            </View>
            <View alignItems="center">
              <Text fontSize="$5" fontWeight="bold" color="white">
                {stats.approved}
              </Text>
              <Text fontSize="$2" color="rgba(255,255,255,0.8)">
                Approved
              </Text>
            </View>
          </XStack>
        </YStack>
      </View>

      {/* Tasks List */}
      <View flex={1} padding="$4" showsVerticalScrollIndicator={false}>
        <YStack space="$4">
          {tasks.length === 0 ? (
            <View
              alignItems="center"
              justifyContent="center"
              paddingVertical="$8"
              space="$4"
            >
              <Calendar size={64} color="$color11" />
              <Text fontSize="$5" color="$color11" textAlign="center">
                No tasks yet
              </Text>
              <Text fontSize="$3" color="$color11" textAlign="center">
                Create your first family task to get started!
              </Text>
            </View>
          ) : (
            tasks.map((task) => (
              <TaskView
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </YStack>
      </View>

      {/* Floating Add Button */}
      <View position="absolute" bottom="$6" right="$4" zIndex={1000}>
        <Button
          size="$5"
          circular
          backgroundColor="$blue10"
          borderColor="$blue10"
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.3}
          shadowRadius={8}
          elevate
          onPress={() => setModalOpen(true)}
          icon={Plus}
          scaleIcon={1.5}
        />
      </View>

      {/* Add Task Modal */}
      <AddTaskModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleAddTask}
        loading={addingTask}
      />
    </View>
  );
}
