import path from "node:path";

import express, { Application } from "express";

export class PathProvider {
  public static init(app: Application, cacheDays: string): void {
    const currentDir = path.dirname(process.argv[1]);
    app.use(
      express.static(path.join(currentDir, "public"), {
        maxAge: Number(cacheDays),
      })
    );
  }
}
export default "path";
