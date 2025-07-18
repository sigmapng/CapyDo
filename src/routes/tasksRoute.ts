import { Hono } from "hono";
import { ToDoService } from "../services/toDoService.ts";
import { type Task } from "../interfaces/task.ts";

const taskRoutes = new Hono();
const todoService = new ToDoService();

// Tasks CRUD
taskRoutes.get("/task/:id", (c) => c.text("Get Task: " + c.req.param("id")));
taskRoutes.post("task/", (c) => c.text("Create Task"));
taskRoutes.put("task/:id", (c) => c.text("Update Task"));
taskRoutes.delete("task/:id", (c) => c.text("Delete Task"));
