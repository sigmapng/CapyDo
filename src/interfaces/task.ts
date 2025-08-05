export interface Task {
  id: number;
  name: string;
  status: "not started" | "in progress" | "completed" | "canceled";
  importance: "low" | "medium" | "high";
  dueTo?: Date;
  dateCreated: Date;
  userId: number;
}

export interface CreateTaskRequest {
  name: string;
  status?: "not started" | "in progress" | "completed" | "canceled";
  importance: "low" | "medium" | "high";
  dueTo?: Date;
}

export interface UpdateTaskRequest {
  name?: string;
  status?: "not started" | "in progress" | "completed" | "canceled";
  importance?: "low" | "medium" | "high";
  dueTo?: Date;
}
