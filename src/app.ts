import express from "express";

import configs from "@/config/config";

import {
  CompressionProvider,
  CorsProvider,
  DatabaseProvider,
  ErrorProvider,
  FileUploadProvider,
  HandlerProvider,
  JsonProvider,
  PageNotFoundProvider,
  // PassportProvider,
  // PathProvider,
  RouteProvider,
  SanitizeProvider,
  // SentryProvider,
  XssProvider,
} from "./provider";

const app = express();
DatabaseProvider.init(configs.mongoose.url, app);
HandlerProvider.init(app);
CompressionProvider.init(app);
JsonProvider.init(app);
FileUploadProvider.init(app);
XssProvider.init(app);
SanitizeProvider.init(app);
// PathProvider.init(app, configs.cacheDays);
CorsProvider.init(app);
// PassportProvider.init(app);
RouteProvider.init(app);
// SentryProvider.init(app, configs.isSentryEnable);
PageNotFoundProvider.init(app);
ErrorProvider.init(app);

export default app;
