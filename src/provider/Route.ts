import { Application, Router } from "express";

import router from "@/modules/index";

export class RouteProvider {
  // Initialize your Route pool
  public static init(app: Application): void {
    const allRoutes: Router = router;
    app.use(`/api`, allRoutes);
  }
}

export default "express";
