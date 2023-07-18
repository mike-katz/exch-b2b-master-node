import { RequestHandler, Router } from "express";

const route = (
  router: Router,
  method: string,
  url: string,
  args: RequestHandler[]
): void => {
  switch (method) {
    case "get":
      router.get(url, ...args);
      break;

    case "post":
      router.post(url, ...args);
      break;

    case "put":
      router.put(url, ...args);
      break;

    case "patch":
      router.patch(url, ...args);
      break;

    case "delete":
      router.delete(url, ...args);
      break;

    default:
      throw new Error("Invalid method");
  }
};

export default route;
