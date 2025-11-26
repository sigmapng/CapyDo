import { Hono } from "hono";
import { authRoute } from "./authRoute.ts";
import { tasksRoute } from "./tasksRoute.ts";

const routes = new Hono();

routes.route("/auth", authRoute);
routes.route("/tasks", tasksRoute);

export default routes;
