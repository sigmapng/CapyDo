import { Hono } from "hono";
import { jwt } from "hono/jwt";
import prisma from "../config/database.ts";
import { z } from "zod";
import { renderPage, type Variables } from "../index.ts";
import { taskService, type Task } from "../services/taskService.ts";

const service = new taskService();
export const tasksRoute = new Hono<{ Variables: Variables }>();

// Tasks
tasksRoute.get("/:username/tasks", async (c) => {
  const users = await prisma.user.findMany({
    include: { tasks: true },
  });

  return c.json({ users });
});

// Create Task
tasksRoute.get("/:username/tasks/create", async (c) => {
  const user = c.get("user");

  const page = await renderPage(c, "tasks/task_create.ejs", {
    title: "Create Task",
    username: user.username,
  });
  return c.html(page);
});

tasksRoute.post("/:username/tasks/create", async (c) => {
  const user = c.get("user");

  try {
    const body = await c.req.parseBody();
    const payload = c.get("jwtPayload");


    return c.redirect(`/${user.username}/tasks`, 303);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    throw error;
  }
});

//Update Task
tasksRoute.put("/:username/tasks", async (c) => {
  const body = await c.req.parseBody();

 
  return c.redirect("/:username/tasks", 301);
});

// Delete Task
tasksRoute.delete("/:username/tasks/:taskId", async (c) => {
  try {
    const taskId = Number(c.req.param("taskId"));
    await service.deleteTask({ id: taskId });
    return c.json({ redirect: `/${c.get("user").username}/tasks` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    throw error;
  }
});
