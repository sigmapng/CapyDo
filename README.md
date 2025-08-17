# CapyDo :green_heart:

**CapyDo** is a modern _task management_ website developed with **Hono**. It allows you to effortlessly _sign up_ or _log in_ to manage your tasks, helping you stay organized and maintain a consistent routine :running_woman:

# Tech stack:

- TypeScript

- Hono

- Node.js

- SCSS

- EJS

- PostgreSQL

- Git

## Libraries, modules, and middleware

**node-postgres** - _Database connection pooling_  
Frequent database requests can create a performance bottleneck. To reduce overhead and improve efficiency, <ins>connection pooling</ins> is used to manage and reuse database connections. Database credentials are provided through **_.env variables_** to ensure security.

**Zod** - _Input validation_  
When signing up or logging in, the user has to provide a "username", "password", and/or "firstname".  
With the help of Zod, we check if the string fits the requirements.

<ins>Password</ins>:

- should be a string

- minimum 8 characters long

- maximum 100 characters long

- must fit this regular expresion - **/^(?=._[a-z])(?=._[A-Z])(?=.\*\d)/**

  - ?=.\*[a-z] at least 1 lowercase letter

  - ?=.\*[A-Z] at least 1 uppercase letter

  - ?=.\*\d at least 1 number

<ins>Username</ins>:

- should be a string

- minimum 3 characters long

- maximum 30 characters long

- must fit this regular expresion - **/^[a-zA-Z0-9_]+$/**

  - only letters, numbers, and underscores allowed

</br>

**bcrypt** - _Password hashing_

**helmet** - _Secure headers_

**JWT** - _JSON web token_

# Logo

Capybara logo belongs to **Delwar018** [Flaticon](https://www.flaticon.com/authors/delwar018)
