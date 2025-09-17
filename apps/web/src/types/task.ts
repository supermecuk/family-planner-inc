export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeColor: string;
  creatorId: string;
  creatorColor: string;
  approverId: string;
  deadline: string;
  status: "pending" | "in-progress" | "completed" | "approved";
}

export interface TaskFormData {
  title: string;
  description: string;
  assigneeId: string;
  assigneeColor: string;
  deadline: string;
}
