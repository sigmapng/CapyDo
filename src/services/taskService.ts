import { client } from "../database/client.ts";
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "../interfaces/task.ts";

export class taskService {
  getTaskInfo(task: Task) {
    client.query(`SELECT * FROM task WHERE name === ${task.name}`);
  }

  createTask(create: CreateTaskRequest) {
    client.query(`
      INSERT INTO task (name, status, importance, due_to, date_created)
      VALUES ${create.name}, ${create.status}, ${create.importance}, ${create.dueTo}, DATE`);
  }

  changeTask(update: UpdateTaskRequest) {
    client.query(`
      UPDATE task
      SET ${update.name}, ${update.status}, ${update.importance}, ${update.dueTo},
      WHERE ${update.name}`);
  }
}
