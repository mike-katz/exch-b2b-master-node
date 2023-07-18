// import * as grecaptcha from "node_modules/@types/grecaptcha";

const captchaSecretKey = process.env.captchaSecretKey || null;

// async function checkCaptchaValidate(
//   captchaKey: string
// ): Promise<boolean | string> {
//   try {
//     const client = new grecaptcha(captchaSecretKey);
//     return client
//       .verify(captchaKey)
//       .then((successCode: string) => successCode)
//       .catch(() => false);
//   } catch (err) {
//     return false;
//   }
// }

async function checkCaptchaValidate(captchaKey: string): Promise<boolean> {
  // Get the captcha response from the user

  // Execute the reCAPTCHA check
  const response = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${captchaSecretKey as string}&response=${captchaKey}`,
    }
  );
  interface RecaptchaResponse {
    success: boolean;
    // Add other properties if necessary
  }

  const recaptchaResponse = (await response.json()) as RecaptchaResponse;
  const typedRecaptchaResponse = recaptchaResponse;

  // Verify the reCAPTCHA response
  return !!typedRecaptchaResponse.success;
}
async function checkRecaptcha(
  captchaKey: string,
  isAvailable = false
): Promise<boolean | string> {
  if (captchaKey !== "captchaToken" && isAvailable) {
    return checkCaptchaValidate(captchaKey);
  }
  return true;
}

export default checkRecaptcha;
