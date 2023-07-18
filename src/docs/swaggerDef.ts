import config from "@/config/config";

import { version } from "../../package.json";

const swaggerDef = {
  openapi: "3.0.0",
  info: {
    title: "Boilerplate API documentation",
    version,
    license: {
      name: "",
      url: "",
    },
  },
  servers: [
    {
      description: "Local Server",
      url: `${config.swaggerURLEndpoint}:${config.port}/api/v1`,
    },
    {
      description: "Test Server",
      url: "http://localhost/v1",
    },
  ],
  components: {
    securitySchemes: {
      clientAuth: { type: "apiKey", in: "header", name: "x-yp-client" },
      otpAuth: { type: "apiKey", in: "header", name: "otp-token" },
    },
  },
  // if we required clientAuth in all api then enable it.
  // security: [
  //   {
  //     clientAuth: [],
  //   },
  // ],
};

export default swaggerDef;
