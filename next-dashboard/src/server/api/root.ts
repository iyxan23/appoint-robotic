import { sessionRouter } from "./routers/session";
import { scheduleRouter } from "./routers/schedule";
import { patientRouter } from "./routers/patient";
import { nfcRouter } from "./routers/nfc";
import { scheduleStreamRouter } from "./routers/scheduleStream";

import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  session: sessionRouter,
  schedule: scheduleRouter,
  patient: patientRouter,
  nfc: nfcRouter,
  scheduleStream: scheduleStreamRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
