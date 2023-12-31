import express from "express";

import { IRoute } from "@/types";

import authRoute from "./auth/auth.route";
import docsRoute from "./docs.route";
import userRoute from "./user/user.route";
import activityRoute from "./activity/activity.route";
import beatingRoute from "./beating/beating.route";
import bankingRoute from "./banking/banking.route";
import marketRoute from "./market/market.route";
import extraRoute from "./extra/extra.route";
import plRoute from "./pl/pl.route";
import reportRoute from "./report/report.route";

const router = express.Router();
const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/user",
    route: userRoute,
  },
  {
    path: "/activity",
    route: activityRoute,
  },
  {
    path: "/beating",
    route: beatingRoute,
  },
  {
    path: "/banking",
    route: bankingRoute,
  },
  {
    path: "/market",
    route: marketRoute,
  },
  {
    path: "/extra",
    route: extraRoute,
  },
  {
    path: "/pl",
    route: plRoute,
  },
  {
    path: "/report",
    route: reportRoute,
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
