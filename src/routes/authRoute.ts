import { Hono } from "hono";
import { renderPage } from "../index.ts";
import { authService } from "../services/authService.ts";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "../interfaces/user.ts";

const service = new authService();
export const authRoute = new Hono();

authRoute.get("/signup", async (c) => {
  const page = await renderPage("sign_up.ejs", { title: "Sign Up" });
  return c.html(page);
});

authRoute.post("/signup", async (c) => {
  const body = await c.req.parseBody();

  const newUser: CreateUserRequest = {
    userName: String(body.username),
    password: String(body.password),
    firstName: String(body.name),
  };

  const existing = await service.getUserInfo({
    userName: newUser.userName,
  } as User);

  if (existing) {
    return c.text("Username already taken");
  }

  // Create new user
  await service.createUser(newUser);
  return c.redirect("/", 301);
});

/* authRoute.get("/", async (c) => {
  const page = await renderPage("", { title: "" });
});

authRoute.get("/", async (c) => {
  const page = await renderPage("", { title: "" });
}); */
