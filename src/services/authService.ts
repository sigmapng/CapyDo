import { client } from "../database/client.ts";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "../interfaces/user.ts";

export class authService {
  async getUserInfo(user: User) {
    const result = await client.query(
      "SELECT * FROM public.users WHERE username = $1",
      [user.userName]
    );
    return result.rows[0];
  }

  async createUser(create: CreateUserRequest) {
    await client.query(
      "INSERT INTO public.users (username, password, name) VALUES ($1, $2, $3)",
      [create.userName, create.password, create.firstName]
    );
  }

  async changeUserInfo(update: UpdateUserRequest) {
    await client.query(
      "UPDATE public.users SET name = $1, password = $2 WHERE username = $3",
      [update.firstName, update.password, update.userName]
    );
  }
}
