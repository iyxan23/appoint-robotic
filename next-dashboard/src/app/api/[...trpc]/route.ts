import { createOpenApiNextAppHandler } from "next-trpc-openapi";
import { type NextRequest } from "next/server";
import { env } from "~/env";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

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

const handler = createOpenApiNextAppHandler({
  router: appRouter,
  createContext,
  responseMeta: undefined,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
          );
        }
      : undefined,
});

export default handler;
