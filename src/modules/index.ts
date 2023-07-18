import express from "express";

import { IRoute } from "@/types";

import authRoute from "./auth/auth.route";
import docsRoute from "./docs.route";
import otpRoute from "./otp/otp.route";
import profileRoute from "./profile/profile.route";

const router = express.Router();
const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/otp",
    route: otpRoute,
  },
  {
    path: "/profile",
    route: profileRoute,
  },
];
const devRoutes = [
  // routes available only in development mode
  {
    path: "/docs",
    route: docsRoute,
  },
];

devRoutes.forEach((route: IRoute) => {
  router.use(route.path, route.route);
});
defaultRoutes.forEach(route => {
  router.use(route.path, route.route);
});

export default router;
