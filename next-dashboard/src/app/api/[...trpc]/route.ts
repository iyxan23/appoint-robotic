import type { NextRequest } from "next/server";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { createOpenApiFetchHandler } from "./trpc-openapi-fetch-handler";

const createContext = async ({
  req,
  resHeaders,
}: {
  req: NextRequest;
  resHeaders: Headers;
}) => {
  return createTRPCContext({
    headers: req.headers,

    cookies: {
      getCookie(name) {
        return req.cookies.get(name)?.value;
      },
      getCookies() {
        return Object.fromEntries(
          req.cookies.getAll().map((rq) => [rq.name, rq.value]),
        );
      },
      setCookie(name, value, attributes) {
        resHeaders.append(
          "set-cookie",
          `${name}=${value}${attributes ? `; ${attributes}` : ""}`,
        );
      },
    },
  });
};

const handler = (req: NextRequest) => {
  return createOpenApiFetchHandler({
    endpoint: "/api",
    router: appRouter,
    createContext: ({ resHeaders }) => createContext({ req, resHeaders }),
    req,
  });
};

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
  handler as HEAD,
};
