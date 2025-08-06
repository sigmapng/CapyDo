import { client } from "../database/client.ts";
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  DeleteTaskRequest,
} from "../interfaces/task.ts";

export class taskService {
  async getTaskInfo(task: Task) {
    const result = await client.query(
      "SELECT * FROM public.task WHERE name = $1",
      [task.name]
    );
    return result.rows[0];
  }

  async createTask(create: CreateTaskRequest) {
    await client.query(
      "INSERT INTO public.task (name, status, importance, due_to, user_id) VALUES ($1, $2, $3, $4, $5)",
      [
        create.name,
        create.status,
        create.importance,
        create.dueTo,
        create.userId,
      ]
    );
  }

  async changeTask(update: UpdateTaskRequest) {
    await client.query(
      " UPDATE public.task SET name = $1, status = $2, importance = $3, due_to = $4, WHERE name = $1",
      [update.name, update.status, update.importance, update.dueTo]
    );
  }

  async deleteTask(remove: DeleteTaskRequest) {
    await client.query("DELETE FROM public.task WHERE name = $1", [
      remove.name,
    ]);
  }
}
