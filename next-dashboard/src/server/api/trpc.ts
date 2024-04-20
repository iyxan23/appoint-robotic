/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { type OpenApiMeta } from "trpc-openapi";
import { ZodError } from "zod";

import { db } from "~/server/db";
import { SESSION_COOKIE, schemaSession, unsealData } from "../session";

export type Cookies = {
  setCookie: (name: string, value: string, attributes?: string) => void;
  getCookie: (name: string) => string | undefined;
  getCookies: () => Record<string, string>;
};

export type TRPCContext = {
  db: typeof db;
  reqHeaders: Headers;
  cookies: Cookies;
};

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = (opts: {
  headers: Headers;
  cookies: Cookies;
}): TRPCContext => {
  return {
    db,
    reqHeaders: opts.headers,
    cookies: opts.cookies,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createTRPCContext>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      };
    },
  });

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Session-injecting procedure
 *
 * This procedure injects a session object into the context. The session is retrieved by parsing
 * the cookie from an incoming request and decrypting it with iron-session.
 */
export const withSessionProcedure = t.procedure.use(async (opts) => {
  const sessionCookie = opts.ctx.cookies.getCookie(SESSION_COOKIE);
  const session = sessionCookie
    ? await schemaSession
        .parseAsync(await unsealData(sessionCookie))
        .catch(() => null)
    : null;

  return opts.next({
    ctx: {
      ...opts.ctx,
      session,
    },
  });
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = withSessionProcedure;

/**
 * Private (authenticated) procedure
 *
 * A procedure which requires session to not be null. If session is null, then it shall return
 * a 404 NOT FOUND error response.
 */
export const privateProcedure = publicProcedure.use(async (opts) => {
  if (opts.ctx.session === null) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  return opts.next({ ctx: { session: opts.ctx.session } });
});
