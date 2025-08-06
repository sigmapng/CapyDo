export interface User {
  id: number;
  firstName: string;
  userName: string;
  password: string;
}
 
export interface CreateUserRequest {
  firstName: string;
  userName: string;
  password: string;
}

/* export interface LoginRequest {
  userName: string;
  password: string;
} */

export interface UpdateUserRequest {
  firstName?: string;
  userName: string;
  password?: string;
}
