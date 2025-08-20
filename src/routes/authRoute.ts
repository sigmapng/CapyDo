import { Hono } from "hono";
import { jwt, sign } from "hono/jwt";
import bcrypt from "bcrypt";
import { z } from "zod";
import { renderPage } from "../index.ts";
import { authService } from "../services/authService.ts";
import { validateRegister, validateLogin } from "../middleware/validation.ts";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "../interfaces/user.ts";
import type { Variables } from "../index.ts";

const service = new authService();
export const authRoute = new Hono<{ Variables: Variables }>();

// Sign Up
authRoute.get("/signup", async (c) => {
  const page = await renderPage(c, "sign_up.ejs", { title: "Sign Up" });
  return c.html(page);
});

authRoute.post("/signup", async (c) => {
  const body = await c.req.parseBody();

  try {
    const validData = await validateRegister({
      username: String(body.username),
      password: String(body.password),
      firstname: String(body.firstname),
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

    const userId = created.id;

    const token = await sign(
      { userId, exp: Math.floor(Date.now() / 1000) + 60 * 60, type: "access" },
      process.env.JWT_SECRET as string
    );

    return c.redirect(`/${created.username}/account`, 303);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    throw error;
  }
});

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

    const userId = loggedIn.id;

    const token = await sign(
      { userId, exp: Math.floor(Date.now() / 1000) + 60 * 60, type: "access" },
      process.env.JWT_SECRET as string
    );

    return c.redirect(`/${loggedIn.username}/account`, 303);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    throw error;
  }
});

// Protecting paths
authRoute.use("/:username/*", async (c, next) => {
  try {
    await jwt({ secret: process.env.JWT_SECRET as string, cookie: "token" })(
      c,
      next
    );
  } catch {
    return c.redirect("/login");
  }

  const payload = c.get("jwtPayload");
  const urlUsername = c.req.param("username");

  const user = await service.getUserById(payload.userId);
  c.set("user", user);

  if (!user || user.username !== urlUsername) {
    return c.text("Forbidden", 403);
  }

  await next();
});

// Account
authRoute.get("/:username/account", async (c) => {
  const user = c.get("user");
  const urlUsername = c.req.param("username");

  if (urlUsername !== user.username) {
    return c.redirect(`/${user.username}/account`, 302);
  }

  const page = await renderPage(c, "account.ejs", {
    title: "Account",
    name: user.firstname,
    username: user.username,
  });

  return c.html(page);
});

// Update
authRoute.get("/:username/account-settings", async (c) => {
  const page = await renderPage(c, "account_settings.ejs", {
    title: "Update information",
  });
  return c.html(page);
});

authRoute.put("/:username/account-settings", async (c) => {
  try {
    const body = await c.req.parseBody();
    const user = c.get("user");

    const hash = await bcrypt.hash(String(body.password), 10);
    const current = await service.getUserById(user.id);

    const userUpdated: UpdateUserRequest = {
      firstname: String(body.firstname),
      password: hash,
      username: current.username,
    };

    await service.changeUserInfo(userUpdated);
    return c.redirect(`/${current.username}/account`, 303);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    throw error;
  }
});

// Log Out
authRoute.post("/:username/account", async (c) => {
  return c.redirect("/", 302);
});

// Delete User
authRoute.delete("/:username/account", async (c) => {
  try {
    const user = c.get("user");

    await service.deleteUser(user.username);

    return c.json({ redirect: "/" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    throw error;
  }
});
