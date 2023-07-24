import path from "node:path";

import * as dotenvSafe from "dotenv-safe";
import Joi from "joi";

dotenvSafe.config({
  path: path.join(path.dirname(process.argv[1]), "..", `.env`),
  allowEmptyValues: false,
  example: ".env.example",
});

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
  email: {
    smtp: {
      host: string;
      port: number;
      auth: {
        user: string;
        pass: string;
      };
    };
    from: string;
    verificationBy: string;
  };
  swaggerURLEndpoint: string;
  // apiVersions: number[];
  mailExpiration: number;
  accessKey: string;
  secretKey: string;
  bucketName: string;
  proposalBucket: string;
  region: string;
  frontURLEndpoint: string;
  encryption: {
    vector: string;
    encryptionMethod: string;
    secretKey: string;
  };
  verificationMode: string;

  loginTypes: {
    email: boolean;
    phone: boolean;
    emailAndPhone: boolean;
    google: boolean;
    facebook: boolean;
    apple: boolean;
  };
  google: { id: string; secret: string };
  facebook: {
    id: string;
    secret: string;
  };
  isSentryEnable: boolean;
  cacheDays: string;
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
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USERNAME: string;
  SMTP_PASSWORD: string;
  EMAIL_FROM: string;
  LOCAL_FRONT_BASEPATH: string;
  STAGE_FRONT_BASEPATH: string;
  ACCESS_KEY: string;
  EMAILVERIFICATION: string;
  VERIFICATIONMODE: string;
  SECRET_KEY: string;
  BUCKET_NAME: string;
  PROPOSAL_BUCKET: string;
  REGION: string;
  VECTOR: string;
  ENCRYPTIONMETHOD: string;
  E_SECRETKEY: string;
  CACHE_DAYS: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  FACEBOOK_APP_ID: string;
  FACEBOOK_APP_SECRET: string;
}

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("production", "development.local", "qa", "development")
      .required(),
    PORT: Joi.number().default(8000),
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
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USERNAME,
  SMTP_PASSWORD,
  EMAIL_FROM,
  LOCAL_FRONT_BASEPATH,
  STAGE_FRONT_BASEPATH,
  ACCESS_KEY,
  EMAILVERIFICATION,
  VERIFICATIONMODE,
  SECRET_KEY,
  BUCKET_NAME,
  PROPOSAL_BUCKET,
  REGION,
  VECTOR,
  ENCRYPTIONMETHOD,
  E_SECRETKEY,
  CACHE_DAYS,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
} = envVars;

const config: configType = {
  env: NODE_ENV,
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
  email: {
    smtp: {
      host: SMTP_HOST,
      port: SMTP_PORT,
      auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD,
      },
    },
    from: EMAIL_FROM,
    verificationBy: EMAILVERIFICATION,
  },
  // rest of the properties

  swaggerURLEndpoint: NODE_ENV === "stage" ? "" : "http://localhost",
  // apiVersions: [1, 2],
  mailExpiration: 7,

  // aws detail
  accessKey: ACCESS_KEY,
  secretKey: SECRET_KEY,
  bucketName: BUCKET_NAME,
  proposalBucket: PROPOSAL_BUCKET,
  region: REGION,

  // front url endpoint
  frontURLEndpoint:
    NODE_ENV === "development" ? LOCAL_FRONT_BASEPATH : STAGE_FRONT_BASEPATH,

  // encryption detail
  encryption: {
    vector: VECTOR, // must be 16 char
    encryptionMethod: ENCRYPTIONMETHOD,
    secretKey: E_SECRETKEY, // must be 32 char
  },

  verificationMode: VERIFICATIONMODE,

  // types of login eneble in project
  loginTypes: {
    email: true,
    phone: true,
    emailAndPhone: true,
    google: true,
    facebook: false,
    apple: false,
  },
  // sentry setting if enable then error visible in sentry
  isSentryEnable: false,

  google: {
    id: GOOGLE_CLIENT_ID,
    secret: GOOGLE_CLIENT_SECRET,
  },
  facebook: {
    id: FACEBOOK_APP_ID,
    secret: FACEBOOK_APP_SECRET,
  },
  cacheDays: CACHE_DAYS,
};

export default config;
