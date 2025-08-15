import pool from "../database/client.ts";
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  DeleteTaskRequest,
} from "../interfaces/task.ts";

export class taskService {
  async getTaskInfo(task: Task) {
    try {
      const result = await pool.query(
        "SELECT id, name, status, importance, dueTo, dateCreated, userId FROM public.task WHERE name = $1",
        [task.name]
      );
      return result.rows[0];
    } catch {
      console.error("Failed to get task by name");
    }
  }

  async getTasksByUserId(userID: number) {
    try {
      const result = await pool.query(
        "SELECT id, name, status, importance, dueTo, dateCreated, userID FROM public.task WHERE userID = $1",
        [userID]
      );
      return result.rows;
    } catch {
      console.error("Failed to get task by user id");
    }
  }

  async createTask(create: CreateTaskRequest) {
    try {
      await pool.query(
        "INSERT INTO public.task (name, status, importance, dueTo, userID) VALUES ($1, $2, $3, $4, $5)",
        [
          create.name,
          create.status,
          create.importance,
          create.dueTo,
          create.userId,
        ]
      );
    } catch {
      console.error("Failed to create task");
    }
  }

  async changeTask(update: UpdateTaskRequest) {
    try {
      await pool.query(
        " UPDATE public.task SET name = $1, status = $2, importance = $3, dueTo = $4, WHERE name = $1",
        [update.name, update.status, update.importance, update.dueTo]
      );
    } catch {
      console.error("Failed to update task");
    }
  }

  async deleteTask(remove: DeleteTaskRequest) {
    try {
      await pool.query("DELETE FROM public.task WHERE id = $1", [remove.id]);
    } catch {
      console.error("Failed to delete task");
    }
  }
}
