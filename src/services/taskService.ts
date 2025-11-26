import prisma from "../config/database.ts";

export interface Task {
  id: number;
  name: string;
  status: string;
  importance: string;
  dueTo: Date | null;
  dateCreated: Date;
  userId: number;
}

export class taskService {
  async getTaskInfo(task: Partial<Task>) {
    try {
      return await prisma.task.findUnique({
        where: { id: task.id },
      });
    } catch (error: unknown) {
      console.error("An unexpected error occurred:", error);
    }
  }

  async getTasksByUserId(userID: number) {
    try {
      return await prisma.task.findMany({
        where: { userId: userID },
      });
    } catch (error: unknown) {
      console.error("An unexpected error occurred:", error);
    }
  }

  async createTask(task: Task) {
    try {
      return await prisma.task.create({
        data: {
          id: task.id,
          name: task.name,
          status: task.status,
          importance: task.importance,
          dueTo: task.dueTo,
          dateCreated: task.dateCreated,
          userId: task.userId,
        },
      });
    } catch (error: unknown) {
      console.error("An unexpected error occurred:", error);
    }
  }

  async changeTask(task: Partial<Task>) {
    try {
      return await prisma.task.update({
        where: { id: task.id },
        data: {
          name: task.name,
          status: task.status,
          importance: task.importance,
          dueTo: task.dueTo,
        },
      });
    } catch (error: unknown) {
      console.error("An unexpected error occurred:", error);
    }
  }

  async deleteTask(task: Partial<Task>) {
    try {
      return await prisma.task.delete({
        where: { id: task.id },
        select: {
          name: true,
          userId: true,
        },
      });
    } catch (error: unknown) {
      console.error("An unexpected error occurred:", error);
    }
  }
}
