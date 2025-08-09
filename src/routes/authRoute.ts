import { Hono } from "hono";
import { renderPage } from "../index.ts";
import { authService } from "../services/authService.ts";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  LoginUserRequest,
  DeleteUserRequest,
} from "../interfaces/user.ts";

const service = new authService();
export const authRoute = new Hono();

// Sign Up
authRoute.get("/signup", async (c) => {
  const page = await renderPage(c, "sign_up.ejs", { title: "Sign Up" });
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
    maxAge: 30 * 86.4, //1 month
    sameSite: "Strict",
  });

  return c.redirect("/", 301);
});

// Log In
authRoute.get("/login", async (c) => {
  const page = await renderPage(c, "login.ejs", { title: "Log In" });
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

  const userId = loggedIn.id;

  await setCookie(c, "cookie", userId, {
    path: "/",
    secure: true,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, //1 month
    sameSite: "Strict",
  });

  return c.redirect("/account", 301);
});

// Account
authRoute.get("/account", async (c) => {
  const userId = await getCookie(c, "cookie");

  if (!userId) {
    return c.redirect("/login");
  }

  const user = await service.getUserById(userId);
  const page = await renderPage(c, "account.ejs", {
    title: "Account",
    name: user.name,
  });
  return c.html(page);
});

// Update
authRoute.get("/account-settings", async (c) => {
  const page = await renderPage(c, "account_settings.ejs", {
    title: "Update information",
  });
  return c.html(page);
});

authRoute.put("/account-settings", async (c) => {
  const body = await c.req.parseBody();

  const userUpdated: UpdateUserRequest = {
    firstName: String(body.firstName),
    password: String(body.password),
    userName: String(body.username),
  };

  const existing = await service.getUserInfo({
    userName: userUpdated.userName,
  } as User);

  if (userUpdated.userName !== existing.userName) {
    return c.text("User with this name doesn't exist");
  }

  await service.changeUserInfo(userUpdated);
  return c.redirect("/account", 301);
});

// Log Out
authRoute.post("/account", async (c) => {
  deleteCookie(c, "cookie", { path: "/" });
  return c.redirect("/", 301);
});

// Delete User
authRoute.delete("/account", async (c) => {
  const userId = await getCookie(c, "cookie");
  console.log(userId);

  if (!userId) {
    return c.redirect("/");
  }

  const user = await service.getUserById(userId);
  const userRemove: DeleteUserRequest = {
    username: user.username,
  };
  console.log(userRemove.username);

  deleteCookie(c, "cookie", { path: "/" });
  await service.deleteUser(userRemove);
  return c.json({ redirect: "/" });
});
