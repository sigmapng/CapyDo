import { Hono } from "hono";
import { jwt, sign } from "hono/jwt";
import bcrypt from "bcrypt";
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
  const username = body.username;

  const token = await sign(
    { username, exp: Math.floor(Date.now() / 1000) + 60 * 60 }, // 1 година
    process.env.JWT_SECRET as string
  );

  const hash = await bcrypt.hash(String(body.password), 10);

  const newUser: CreateUserRequest = {
    username: String(body.username),
    password: hash,
    firstname: String(body.firstname),
  };

  const existing = await service.getUserInfo({
    username: newUser.username,
  } as User);

  if (existing) {
    return c.text("Username already taken");
  }

  await service.createUser(newUser);

  const created = await service.getUserInfo({
    username: newUser.username,
  } as User);
  console.log("Created user:", created);
  const userId = created.id;

  await setCookie(c, "userId", userId, {
    path: "/",
    secure: true,
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60, //1 month
    sameSite: "Strict",
  });

  return c.redirect("/", 301);
});

authRoute.use(
  "/*",
  jwt({
    secret: process.env.JWT_SECRET as string,
  })
);

// Log In
authRoute.get("/login", async (c) => {
  const page = await renderPage(c, "login.ejs", { title: "Log In" });
  return c.html(page);
});

authRoute.post("/login", async (c) => {
  const body = await c.req.parseBody();

  const userLoginRequest: LoginUserRequest = {
    username: String(body.username),
    password: String(body.password),
  };

  const existing = await service.getUserInfo({
    username: userLoginRequest.username,
    password: userLoginRequest.password,
  } as User);

  const hash = existing.password;

  if (bcrypt.compareSync(userLoginRequest.password, hash) === false) {
    return c.text(
      "There is no user registered with this username or the password is incorrect"
    );
  }

  await service.loginUser(userLoginRequest);

  const loggedIn = await service.getUserInfo({
    username: userLoginRequest.username,
  } as User);

  const userId = loggedIn.id;

  await setCookie(c, "userId", userId, {
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
  const userId = await getCookie(c, "userId");
  const userJwt = c.get("jwtPayload"); 

  if (!userId) {
    return c.redirect("/login");
  }

  const user = await service.getUserById(userId);
  const page = await renderPage(c, "account.ejs", {
    title: "Account",
    name: user.firstname,
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

  const hash = await bcrypt.hash(String(body.password), 10);

  const userUpdated: UpdateUserRequest = {
    firstname: String(body.firstname),
    password: hash,
    username: String(body.username),
  };

  const existing = await service.getUserInfo({
    username: userUpdated.username,
  } as User);

  if (userUpdated.username !== existing.username) {
    return c.text("User with this name doesn't exist");
  }

  await service.changeUserInfo(userUpdated);
  return c.redirect("/account", 301);
});

// Log Out
authRoute.post("/account", async (c) => {
  deleteCookie(c, "userId", { path: "/" });
  return c.redirect("/", 301);
});

// Delete User
authRoute.delete("/account", async (c) => {
  const userId = await getCookie(c, "userId");
  console.log(userId);

  if (!userId) {
    return c.redirect("/");
  }

  const user = await service.getUserById(userId);
  const userRemove: DeleteUserRequest = {
    username: user.username,
  };
  console.log(userRemove.username);

  deleteCookie(c, "userId", { path: "/" });
  await service.deleteUser(userRemove);
  return c.json({ redirect: "/" });
});
