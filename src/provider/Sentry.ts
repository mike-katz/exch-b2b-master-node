import * as Sentry from "@sentry/node";
import { Application } from "express";

export class SentryProvider {
  // Initialize your Sentry pool
  public static init(app: Application, isSentryEnable: boolean): void {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Sentry.Integrations.Express({ app }),
        // Automatically instrument Node.js libraries and frameworks
        ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
      ],

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1,
    });

    if (isSentryEnable) {
      // RequestHandler creates a separate execution context, so that all
      // transactions/spans/breadcrumbs are isolated across requests
      app.use(Sentry.Handlers.requestHandler());
      // TracingHandler creates a trace for every incoming request
      app.use(Sentry.Handlers.tracingHandler());
      // The error handler must be before any other error middleware and after all controllers
      app.use(Sentry.Handlers.errorHandler());
    }
  }
}

export default "sentry";
