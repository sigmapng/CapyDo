import { Hono } from "hono";
import { taskService } from "../services/taskService.ts";
import { type Task } from "../interfaces/task.ts";

export const taskRoute = new Hono();

/* // Tasks CRUD
taskRoute.get("/task/:id", (c) => c.text("Get Task: " + c.req.param("id")));
taskRoute.post("task/", (c) => c.text("Create Task"));
taskRoute.put("task/:id", (c) => c.text("Update Task"));
taskRoute.delete("task/:id", (c) => c.text("Delete Task"));
 */