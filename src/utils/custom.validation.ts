import { CustomHelpers, ErrorReport } from "joi";

const passwordCheck = (
  value: string,
  helpers: CustomHelpers<unknown>
): ErrorReport | string => {
  if (value.length < 8) {
    return helpers.error("any.invalid");
  }
  if (
    !/\d/.test(value) ||
    !/[A-Za-z]/.test(value) ||
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!$%&*?@])[\d!$%&*?@A-Za-z]{8,}$/.test(
      value
    )
  ) {
    return helpers.error("any.invalid");
  }
  return value;
};

export default passwordCheck;
