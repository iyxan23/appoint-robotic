import "server-only";

import { cookies, headers } from "next/headers";
import { cache } from "react";

import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = () => {
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

export const api = createCaller(createContext);
