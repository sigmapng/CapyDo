import { Hono } from "hono";
import { renderPage } from "../index.ts";
import { taskService } from "../services/taskService.ts";
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  DeleteTaskRequest,
} from "../interfaces/task.ts";
import { getCookie, setCookie } from "hono/cookie";

const service = new taskService();
export const taskRoute = new Hono();

// Tasks
taskRoute.get("/tasks", async (c) => {
  const userId = await getCookie(c, "userId");

  if (!userId) {
    return c.redirect("/login");
  }

  const tasks = await service.getTasksByUserId(Number(userId));
  const page = await renderPage(c, "tasks.ejs", {
    title: "Tasks",
    tasks,
  });

  return c.html(page);
});

// Create Task
taskRoute.get("/task/create", async (c) => {
  const page = await renderPage(c, "task_create.ejs", { title: "Tasks" });
  return c.html(page);
});

taskRoute.post("/task/create", async (c) => {
  const body = await c.req.parseBody();

  const newTask: CreateTaskRequest = {
    name: String(body.name),
    status: String(body.status),
    importance: String(body.importance),
    dueTo: new Date(String(body.dueTo)),
    userId: Number(getCookie(c, "userId")),
  };

  await service.createTask(newTask);

  await setCookie(c, "taskName", newTask.name, {
    path: "/",
    secure: true,
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60, //1 month
    sameSite: "Strict",
  });

  return c.redirect("/tasks", 301);
});

//Update Task
taskRoute.put("/tasks", async (c) => {
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
taskRoute.delete("/tasks", async (c) => {
  const task = await getCookie(c, "taskName");
  console.log(task);
  const taskName = await service.getTaskInfo({
    name: task,
  } as Task);

  const taskId = taskName.id;

  const taskRemove: DeleteTaskRequest = {
    id: Number(taskId),
  };
  console.log(taskId);

  await service.deleteTask(taskRemove);
  return c.json({ redirect: "/tasks" });
});
