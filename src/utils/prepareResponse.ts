import { IResponseFormat } from "@/types";

interface Iparams {
  code: string;
  message?: string;
  data?: unknown;
  error?: boolean;
}
const prepareResponse = ({
  code,
  message = "",
  data = null,
  error = false,
}: Iparams): IResponseFormat => ({
  code,
  message,
  data,
  error,
});

export default prepareResponse;
