import { Hono } from "hono";
import { renderPage } from "../index.ts";
import { taskService } from "../services/taskService.ts";
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  DeleteTaskRequest,
} from "../interfaces/task.ts";
import { getCookie } from "hono/cookie";

const service = new taskService();
export const taskRoute = new Hono();

// Tasks
taskRoute.get("/tasks", async (c) => {
  const page = await renderPage(c, "tasks.ejs", { title: "Tasks" });
  return c.html(page);
});

// Create Task
taskRoute.get("/newtask", async (c) => {
  const page = await renderPage(c, "task_id.ejs", { title: "Tasks" });
  return c.html(page);
});

taskRoute.post("/newtask", async (c) => {
  const body = await c.req.parseBody();

  const newTask: CreateTaskRequest = {
    name: String(body.name),
    status: String(body.status),
    importance: String(body.importance),
    dueTo: new Date(String(body.due_to)),
    userId: Number(getCookie(c, "cookie")),
  };

  await service.createTask(newTask);
  return c.redirect("/tasks", 301);
});

//Update Task
taskRoute.get("/task:id", async (c) => {
  const page = await renderPage(c, "task_id.ejs", { title: "Tasks" });
  return c.html(page);
});

taskRoute.put("/task:id", async (c) => {
  const body = await c.req.parseBody();

  const taskUpdated: UpdateTaskRequest = {
    name: String(body.name),
    status: String(body.status),
    importance: String(body.importance),
    dueTo: new Date(),
  };

  const existing = await service.getTaskInfo({
    name: taskUpdated.name,
  } as Task);

  if (taskUpdated.name?.toLowerCase !== existing.name.toLowerCase) {
    return c.text("Task with this name doesn't exist");
  }

  await service.changeTask(taskUpdated);
  return c.redirect("/tasks", 301);
});

// Delete Task
taskRoute.delete("/task:id", async (c) => {
  const body = await c.req.parseBody();

  const taskRemove: DeleteTaskRequest = {
    name: String(body.name),
  };

  await service.deleteTask(taskRemove);
  return c.redirect("/tasks", 301);
});
