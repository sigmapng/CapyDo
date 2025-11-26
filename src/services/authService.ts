import { pool } from "../database/client.ts";

export interface User {
  id?: number;
  firstname?: string;
  username?: string;
  password?: string;
}

export class authService {
  async getUserInfo(user: User) {
    try {
      const result = await pool.query(
        "SELECT id, username, password, firstname FROM public.users WHERE username = $1",
        [user.username]
      );
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error caught:", error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  }

  async getUserById(id: any) {
    try {
      const result = await pool.query(
        "SELECT id, username, password, firstname FROM public.users WHERE id = $1",
        [id]
      );
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error caught:", error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  }

  async createUser(create: User) {
    try {
      await pool.query(
        "INSERT INTO public.users (username, password, firstname) VALUES ($1, $2, $3)",
        [create.username, create.password, create.firstname]
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error caught:", error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  }

  async changeUserInfo(update: User) {
    try {
      await pool.query(
        "UPDATE public.users SET firstname = $1, password = $2 WHERE username = $3",
        [update.firstname, update.password, update.username]
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error caught:", error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  }

  async deleteUser(username: string) {
    try {
      await pool.query("DELETE FROM public.users WHERE username = $1", [
        username,
      ]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error caught:", error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  }
}

/* // Account
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
 */
