import { Hono } from "hono";
import { renderPage } from "../index.ts";
import { authService } from "../services/authService.ts";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  LoginUserRequest,
} from "../interfaces/user.ts";

const service = new authService();
export const authRoute = new Hono();

// Sign Up
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

  await service.createUser(newUser);

  const created = await service.getUserInfo({
    userName: newUser.userName,
  } as User);
  console.log("Created user:", created);
  const userId = created.id;

  await setCookie(c, "cookie", userId, {
    path: "/",
    secure: true,
    httpOnly: true,
    maxAge: 60 * 60 * 24, //1 day
    sameSite: "Strict",
  });

  return c.redirect("/", 301);
});

// Log In
authRoute.get("/login", async (c) => {
  const page = await renderPage("login.ejs", { title: "Log In" });
  return c.html(page);
});

authRoute.post("/login", async (c) => {
  const body = await c.req.parseBody();

  const userLoginRequest: LoginUserRequest = {
    userName: String(body.username),
    password: String(body.password),
  };

  const existing = await service.getUserInfo({
    userName: userLoginRequest.userName,
    password: userLoginRequest.password,
  } as User);

  if (
    existing.userName !== userLoginRequest.userName &&
    existing.password !== userLoginRequest.password
  ) {
    return c.text(
      "There is no user registered with this username or the password is incorrect"
    );
  }

  await service.loginUser(userLoginRequest);

  const loggedIn = await service.getUserInfo({
    userName: userLoginRequest.userName,
  } as User);
  console.log("Logged in user:", loggedIn);
  const userId = loggedIn.id;

  await setCookie(c, "cookie", userId, {
    path: "/",
    secure: true,
    httpOnly: true,
    maxAge: 60 * 60 * 24, //1 day
    sameSite: "Strict",
  });
  return c.redirect("/account", 301);
});

// Update
authRoute.get("/account", async (c) => {
  const page = await renderPage("account.ejs", { title: "Update information" });
  return c.html(page);
});
