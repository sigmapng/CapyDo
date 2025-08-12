export interface Task {
  id: number;
  name: string;
  status: string;
  importance: string;
  dueTo?: Date;
  dateCreated: Date;
  userId: number;
}

export interface CreateTaskRequest {
  name: string;
  status?: string;
  importance: string;
  dueTo?: Date;
  userId: number;
}

export interface UpdateTaskRequest {
  name?: string;
  status?: string;
  importance?: string;
  dueTo?: Date;
}

export interface DeleteTaskRequest {
  id: number;
}
