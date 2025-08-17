export interface User {
  id: number;
  firstname: string;
  username: string;
  password: string;
}

export interface CreateUserRequest {
  firstname: string;
  username: string;
  password: string;
}

export interface UpdateUserRequest {
  firstname?: string;
  username: string;
  password?: string;
}

export interface DeleteUserRequest {
  username: string;
}
