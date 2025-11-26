import { pool } from "../database/client.ts";

export interface Task {
  id?: number;
  name?: string;
  status?: string;
  importance?: string;
  dueTo?: Date;
  dateCreated?: Date;
  userId?: number;
}

export class taskService {
  async getTaskInfo(task: Task) {
    try {
      const result = await pool.query(
        "SELECT id, name, status, importance, dueTo, dateCreated, userId FROM public.task WHERE name = $1",
        [task.name]
      );
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error caught:", error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  }

  async getTasksByUserId(userID: number) {
    try {
      const result = await pool.query(
        "SELECT id, name, status, importance, dueTo, dateCreated, userId FROM public.task WHERE userId = $1",
        [userID]
      );
      return result.rows;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error caught:", error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  }

  async createTask(create: Task) {
    try {
      await pool.query(
        "INSERT INTO public.task (name, status, importance, dueTo, userId) VALUES ($1, $2, $3, $4, $5)",
        [
          create.name,
          create.status,
          create.importance,
          create.dueTo,
          create.userId,
        ]
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error caught:", error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  }

  async changeTask(update: Task) {
    try {
      await pool.query(
        "UPDATE public.task SET name = $1, status = $2, importance = $3, 'dueTo' = $4 WHERE name = $1",
        [update.name, update.status, update.importance, update.dueTo]
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error caught:", error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  }

  async deleteTask(remove: Task) {
    try {
      await pool.query("DELETE FROM public.task WHERE id = $1", [remove.id]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error caught:", error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  }
}
