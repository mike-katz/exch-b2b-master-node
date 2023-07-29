import dotenv from "dotenv";
import path from "node:path";
import Joi from "joi";

dotenv.config({ path: path.join(__dirname, "../../.env") });

interface configType {
  env: string;
  port: number;
  mongoose: {
    url: string;
  };
  jwt: {
    secret: string;
    accessExpirationMinutes: number;
    refreshExpirationDays: number;
    resetPasswordExpirationMinutes: number;
    verifyEmailExpirationMinutes: number;
  };
  swaggerURLEndpoint: string;
  mailExpiration: number;
  accessKey: string;
  secretKey: string;
  bucketName: string;
  proposalBucket: string;
  region: string;
  frontURLEndpoint: string;
}

interface EnvVars {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URL: string;
  JWT_SECRET: string;
  JWT_ACCESS_EXPIRATION_MINUTES: number;
  JWT_REFRESH_EXPIRATION_DAYS: number;
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: number;
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: number;
}

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("production", "development.local", "qa", "development")
      .required(),
    PORT: Joi.number().default(5000),
    MONGODB_URL: Joi.string().required().description("Mongo DB url"),
    JWT_SECRET: Joi.string().required().description("JWT secret key"),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description("minutes after which access tokens expire"),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description("days after which refresh tokens expire"),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description("minutes after which reset password token expires"),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description("minutes after which verify email token expires"),
    SMTP_HOST: Joi.string().description("server that will send the emails"),
    SMTP_PORT: Joi.number().description("port to connect to the email server"),
    SMTP_USERNAME: Joi.string().description("username for email server"),
    SMTP_PASSWORD: Joi.string().description("password for email server"),
    EMAIL_FROM: Joi.string().description(
      "the from field in the emails sent by the app"
    ),
    LOCAL_FRONT_BASEPATH: Joi.string().description("Local front url endpoint"),
    STAGE_FRONT_BASEPATH: Joi.string().description("STAGE front url endpoint"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env) as unknown as {
  value: EnvVars;
  error?: Joi.ValidationError;
};
// console.log("🚀 ~ file: config.ts:42 ~ envVars:", envVars);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const {
  NODE_ENV,
  PORT,
  MONGODB_URL,
  JWT_SECRET,
  JWT_ACCESS_EXPIRATION_MINUTES,
  JWT_REFRESH_EXPIRATION_DAYS,
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
} = envVars;

const config: configType = {
  env: "production",
  port: PORT,
  mongoose: {
    url: `${MONGODB_URL}${NODE_ENV === "test" ? "-test" : ""}`,
  },
  jwt: {
    secret: JWT_SECRET,
    accessExpirationMinutes: JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  swaggerURLEndpoint: NODE_ENV === "stage" ? "" : "http://localhost",
  mailExpiration: 7,

  // aws detail
  accessKey: "",
  secretKey: "",
  bucketName: "",
  proposalBucket: "",
  region: "",
  frontURLEndpoint: "",
};

export default config;
