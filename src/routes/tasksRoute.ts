import { Hono } from "hono";

import prisma from "../config/database.ts";
import * as validation from "../middleware/validation.ts";
import * as jwt from "../middleware/session.ts";

import { z } from "zod";
import { renderPage, type Variables } from "../index.ts";
import { getCookie } from "hono/cookie";

export const tasksRoute = new Hono<{ Variables: Variables }>();

export interface Task {
  id: number;
  name: string;
  status: string;
  importance: string;
  dueTo: Date;
  dateCreated: Date;
  userId: number;
}

// Tasks
tasksRoute.get("/tasks", async (c) => {
  const authToken = getCookie(c, "auth-token");
  if (!authToken) return c.json({ error: "Unauthorized" }, 401);

  const payload = await jwt.verifyToken(authToken);
  if (!payload || typeof payload.userId !== "number") {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const userTasks = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { tasks: true },
  });

  if (!userTasks) return c.json({ error: "User not found" }, 404);

  return c.json({ userTasks });
});

// Create Task
tasksRoute.get("/tasks/create", async (c) => {
  try {
    const page = await renderPage(c, "tasks/task_create.ejs", {
      title: "Create task",
    });
    return c.html(page);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    console.error("Signup error:", error);
    return c.text("Internal server error", 500);
  }
});

tasksRoute.post("/tasks/create", async (c) => {
  try {
    const body = await c.req.parseBody();

    const validTaskData = await validation.validateTask({
      name: body.name,
      status: body.status,
      importance: body.importance,
      dueTo: body.dueTo,
    });

    const userId = getCookie(c, "auth-token");

    await prisma.task.create({
      data: {
        name: validTaskData.name,
        status: validTaskData.status,
        importance: validTaskData.importance,
        dueTo: validTaskData.dueTo,
        userId: Number(userId),
      },
    });

    return c.redirect(`/tasks`, 303);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    console.error("Task create error:", error);
    return c.text("Internal server error", 500);
  }
});

//Update Task
tasksRoute.get("/tasks", async (c) => {
  try {
    const page = await renderPage(c, "tasks/task_update.ejs", {
      title: "Update task",
    });
    return c.html(page);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    console.error("Task update error:", error);
    return c.text("Internal server error", 500);
  }
});

tasksRoute.put("/tasks", async (c) => {
  try {
    const body = await c.req.parseBody();

    const validTaskData = await validation.validateTask({
      name: body.name,
      status: body.status,
      importance: body.importance,
      dueTo: body.dueTo,
    });

    const currentTask: Task = await prisma.task.findUniqueOrThrow({
      where: {
        id: Number(body.id),
      },
    });

    prisma.task.update({
      where: { id: currentTask.id },
      data: {
        name: validTaskData.name,
        status: validTaskData.status,
        importance: validTaskData.importance,
        dueTo: validTaskData.dueTo,
      },
    });
    return c.redirect("/tasks", 301);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    console.error("Task update error:", error);
    return c.text("Internal server error", 500);
  }
});

// Delete Task
tasksRoute.delete("/tasks/", async (c) => {
  try {
    const body = await c.req.parseBody();

    const currentTask = await prisma.task.findUniqueOrThrow({
      where: {
        id: Number(body.id),
      },
    });

    await prisma.task.delete({
      where: { id: currentTask.id },
      select: {
        name: true,
        userId: true,
      },
    });

    return c.json({ redirect: `/tasks` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    throw error;
  }
});
