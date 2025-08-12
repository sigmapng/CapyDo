import pool from "../database/client.ts";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  LoginUserRequest,
  DeleteUserRequest,
} from "../interfaces/user.ts";

export class authService {
  async getUserInfo(user: User) {
    const result = await pool.query(
      "SELECT id, username, password, name FROM public.users WHERE username = $1",
      [user.userName]
    );
    return result.rows[0];
  }

  async getUserById(id: string) {
    const result = await pool.query(
      "SELECT * FROM public.users WHERE id = $1",
      [id]
    );
    return result.rows[0];
  }

  async createUser(create: CreateUserRequest) {
    await pool.query(
      "INSERT INTO public.users (username, password, name) VALUES ($1, $2, $3)",
      [create.userName, create.password, create.firstName]
    );
  }

  async loginUser(login: LoginUserRequest) {
    await pool.query(
      "SELECT username, password FROM public.users WHERE username = $1",
      [login.userName]
    );
  }

  async changeUserInfo(update: UpdateUserRequest) {
    await pool.query(
      "UPDATE public.users SET name = $1, password = $2 WHERE username = $3",
      [update.firstName, update.password, update.userName]
    );
  }

  async deleteUser(remove: DeleteUserRequest) {
    await pool.query("DELETE FROM public.users WHERE username = $1", [
      remove.username,
    ]);
  }
}
