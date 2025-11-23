import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { z } from "zod";
import type { Variables } from "../index.ts";
import { renderPage } from "../index.ts";
import { taskService } from "../services/taskService.ts";
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "../interfaces/task.ts";

const service = new taskService();
export const taskRoute = new Hono<{ Variables: Variables }>();

// Tasks
taskRoute.get("/:username/tasks", async (c) => {
  const user = c.get("user");

  const tasks = await service.getTasksByUserId(Number(user.id));
  const page = await renderPage(c, "tasks.ejs", {
    title: "Tasks",
    tasks,
  });

  return c.html(page);
});

// Create Task
taskRoute.get("/:username/tasks/create", async (c) => {
  const user = c.get("user");

  const page = await renderPage(c, "task_create.ejs", {
    title: "Create Task",
    username: user.username,
  });
  return c.html(page);
});

taskRoute.post("/:username/tasks/create", async (c) => {
  const user = c.get("user");

  try {
    const body = await c.req.parseBody();
    const payload = c.get("jwtPayload");

    const newTask: CreateTaskRequest = {
      name: String(body.name),
      status: String(body.status),
      importance: String(body.importance),
      dueTo: new Date(String(body.dueTo)),
      userId: Number(payload.id),
    };

    await service.createTask(newTask);

    return c.redirect(`/${user.username}/tasks`, 303);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    throw error;
  }
});

//Update Task
taskRoute.put("/:username/tasks", async (c) => {
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
  return c.redirect("/:username/tasks", 301);
});

// Delete Task
taskRoute.delete("/:username/tasks/:taskId", async (c) => {
  try {
    taskRoute.delete("/:username/tasks/:taskId", async (c) => {
      const taskId = Number(c.req.param("taskId"));
      await service.deleteTask({ id: taskId });
      return c.json({ redirect: `/${c.get("user").username}/tasks` });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    throw error;
  }
});
