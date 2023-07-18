import mongoose from "mongoose";
import nodemailer from "nodemailer";

import config from "@/config/config";
import { encryptData } from "@/config/encryption";
import emailLogger from "@/config/logger";
import { User } from "@/types/user.interfaces";
import emailTemplate from "@/utils/emailTemplate";

const transport = nodemailer.createTransport(config.email.smtp);

const getEmailRedirectPath = (role: string): string =>
  role === "admin" ? "admin" : "auth";

/* istanbul ignore next */
const ignoreNext = async (): Promise<void> => {
  if (config.env !== "test") {
    try {
      await transport.verify();
      emailLogger.info("Connected to email server");
    } catch (error) {
      emailLogger.warn(
        "Unable to connect to email server. Make sure you have configured the SMTP options in .env"
      );
    }
  }
};
ignoreNext()
  .then(() => emailLogger.info("Connected to email server"))
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch((error: unknown) => emailLogger.warn(`Failed`, error));

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} name
 * @param {string} url
 * @returns {Promise}
 */
const sendEmail = async (
  to: string,
  subject: string,
  name: string,
  url: string,
  type: string,
  data?: User
): Promise<void> => {
  let html = "";

  if (type === "verify") {
    html = await emailTemplate.verifyTemplate(name, url);
  } else if (type === "sendOtp" && data) {
    html = await emailTemplate.sendOtpTemplate(name, data.otp);
  } else {
    html = await emailTemplate.forgotTemplate(name, url, to);
  }
  const mailOptions = {
    from: config.email.from,
    to,
    subject,
    html,
  };
  await transport.sendMail(mailOptions);
  transport.close();
};

/**
 * Send reset password email
 * @param {User} user
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (
  user: User,
  token: string,
  userRole: string
): Promise<void> => {
  const path = getEmailRedirectPath(userRole);
  const SUBJECT = "Forgot Password";
  const string = token;
  const verificationEmailUrl = `${config.frontURLEndpoint}/${path}/reset-password?token=${string}`;
  const fullName = `${user.firstName} ${user.lastName}`;
  await sendEmail(
    user.email,
    SUBJECT,
    fullName,
    verificationEmailUrl,
    "forgot"
  );
};

/**
 * Send OTP email
 * @param {User} user
 * @returns {Promise}
 */
const sendOtpEmail = async (user: User): Promise<void> => {
  const SUBJECT = "Verification Code";
  const fullName = `${user.firstName} ${user.lastName}`;
  await sendEmail(user.email, SUBJECT, fullName, "", "sendOtp", user);
};

// /**
//  * Send verification email
//  * @param {string} email
//  * @param {string} token
//  * @param {string} fullName
//  * @param {string} id
//  * @returns {Promise}
//  */
const sendVerificationEmail = async (
  email: string,
  token: string,
  fullName: string,
  id: mongoose.Types.ObjectId,
  userRole: string
): Promise<void> => {
  const path = getEmailRedirectPath(userRole);
  const SUBJECT = "Email Verification";
  const string = `${token.toString()}||${id.toString()}`;
  const encryptedString = encryptData(string);
  const verificationEmailUrl = `${config.frontURLEndpoint}/${path}/verify-email?token=${encryptedString}`;
  await sendEmail(email, SUBJECT, fullName, verificationEmailUrl, "verify");
};
/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @param {string} name
 * @returns {Promise<void>}
 */

export {
  sendEmail,
  sendOtpEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  transport,
};
