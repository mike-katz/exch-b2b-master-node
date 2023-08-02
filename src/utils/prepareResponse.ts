import { IResponseFormat } from "@/types";

interface Iparams {
  message?: string;
  data?: unknown;
  // error?: boolean;
}
const prepareResponse = ({
  message = "",
  data = null,
  // error = false,
}: Iparams): IResponseFormat => ({
  message,
  data,
  // error,
});

export default prepareResponse;
