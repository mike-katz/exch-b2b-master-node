import { IResponseFormat } from "@/types";

interface Iparams {
  msg: string;
  message?: string;
  data?: unknown;
  error?: boolean;
}
const prepareResponse = ({
  msg,
  message = "",
  data = null,
  error = false,
}: Iparams): IResponseFormat => ({
  msg,
  message,
  data,
  error,
});

export default prepareResponse;
