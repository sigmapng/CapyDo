class Users {
  id: number;
  firstName: string;
  userName: string;
  private password: number;

  constructor(
    id: number,
    firstName: string,
    userName: string,
    password: number
  ) {
    this.id = id;
    this.firstName = firstName;
    this.userName = userName;
    this.password = password;
  }
}
