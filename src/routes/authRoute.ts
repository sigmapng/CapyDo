import { Hono } from "hono";
import { jwt, sign } from "hono/jwt";
import bcrypt from "bcrypt";
import { z } from "zod";
import { renderPage } from "../index.ts";
import { authService } from "../services/authService.ts";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { validateRegister, validateLogin } from "../middleware/validation.ts";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
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

  try {
    const validData = await validateRegister({
      username: String(body.username),
      password: String(body.password),
      firstName: String(body.firstName),
    });

    const hash = await bcrypt.hash(validData.password, 10);

    const newUser: CreateUserRequest = {
      username: validData.username,
      password: hash,
      firstname: validData.firstname,
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

    await setCookie(c, "userId", created.id, {
      path: "/",
      secure: true,
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60, // 1 month
      sameSite: "Strict",
    });

    return c.redirect("/", 301);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    throw error;
  }
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

  try {
    const validData = await validateLogin({
      username: String(body.username),
      password: String(body.password),
    });

    const existing = await service.getUserInfo({
      username: validData.username,
    } as User);

    if (!existing) {
      return c.text("User not found", 404);
    }

    const isValid = await bcrypt.compare(validData.password, existing.password);
    if (!isValid) {
      return c.text("Invalid username or password", 401);
    }

    const loggedIn = await service.getUserInfo({
      username: validData.username,
    } as User);

    await setCookie(c, "userId", loggedIn.id, {
      path: "/",
      secure: true,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, //1 month
      sameSite: "Strict",
    });

    return c.redirect("/account", 301);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    throw error;
  }
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
