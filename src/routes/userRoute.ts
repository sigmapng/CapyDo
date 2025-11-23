import { Hono } from "hono";
import bcrypt from "bcrypt";
import { z } from "zod";
import { renderPage } from "../index.ts";
import { authService } from "../services/authService.ts";
import type {
  UpdateUserRequest,
} from "../interfaces/user.ts";
import { getCookie, deleteCookie } from "hono/cookie";
import type { Variables } from "../index.ts";

const service = new authService();
export const userRoute = new Hono<{ Variables: Variables }>();

// Account
userRoute.get("/:username/account", async (c) => {
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
userRoute.get("/:username/account-settings", async (c) => {
  const page = await renderPage(c, "account_settings.ejs", {
    title: "Update information",
  });
  return c.html(page);
});

userRoute.put("/:username/account-settings", async (c) => {
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

// Delete User
userRoute.delete("/:username/account", async (c) => {
  try {
    const user = c.get("user");

    await service.deleteUser(user.username);
    deleteCookie(c, "auth-token");

    return c.json({ redirect: "/" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400);
    }
    throw error;
  }
});
