import "server-only";

import { cookies, headers } from "next/headers";
import { cache } from "react";

import { type AppRouter, appRouter, createCaller } from "~/server/api/root";
import { observable } from "@trpc/server/observable";
import { createTRPCContext } from "~/server/api/trpc";
import SuperJSON from "superjson";
import { TRPCClientError, createTRPCProxyClient, loggerLink } from "@trpc/client";
import { callProcedure } from "@trpc/server";
import type { TRPCErrorResponse } from "@trpc/server/rpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = async () => {
  const cookis = cookies();
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
    cookies: {
      getCookie(name) {
        return cookis.get(name)?.value;
      },
      getCookies() {
        return Object.fromEntries(
          cookies()
            .getAll()
            .map((rq) => [rq.name, rq.value]),
        );
      },
      setCookie(_name, _value) {
        throw new Error(
          "Unable to modify cookies in an RSC, use a middleware or API Routes instead.",
        );
      },
    },
  });
};

export const api = createTRPCProxyClient<AppRouter>({
  transformer: SuperJSON,
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    /**
     * Custom RSC link that lets us invoke procedures without using http requests. Since Server
     * Components always run on the server, we can just call the procedure as a function.
     */
    () =>
      ({ op }) =>
        observable((observer) => {
          createContext()
            .then((ctx) => {
              return callProcedure({
                procedures: appRouter._def.procedures,
                path: op.path,
                rawInput: op.input,
                ctx,
                type: op.type,
              });
            })
            .then((data) => {
              observer.next({ result: { data } });
              observer.complete();
            })
            .catch((cause: TRPCErrorResponse) => {
              observer.error(TRPCClientError.from(cause));
            });
        }),
  ],
});
