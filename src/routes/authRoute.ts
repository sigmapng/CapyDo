import { Hono } from "hono";
import { ToDoService } from "../services/toDoService.ts";
import { type User } from "../interfaces/user.ts";

const authRoute = new Hono();
const todoService = new ToDoService();

// authRoute CRUD
authRoute.get("/login/", (c) => c.text("Login into Account"));

authRoute.get("user/", (c) => c.text("Show User Profile"));
authRoute.put("user/:id", (c) => c.text("Update Profile"));
authRoute.delete("user/:id", (c) => c.text("Delete User Profile"));
