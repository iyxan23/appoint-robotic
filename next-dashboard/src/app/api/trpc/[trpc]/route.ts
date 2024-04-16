import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "~/env";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = ({
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

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: ({ resHeaders }) => createContext({ req, resHeaders }),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
