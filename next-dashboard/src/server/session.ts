import "server-only";
import { z } from "zod";
import {
  unsealData as ironUnsealData,
  sealData as ironSealData,
} from "iron-session";
import { env } from "~/env";
import type { TRPCContext } from "./api/trpc";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = env.SESSION_MAX_AGE ?? 60 * 60 * 24 * 30;

export const ironSessionConfig = {
  password: env.IRON_SESSION_PASSWORD,
};

export const schemaSession = z.object({
  id: z.number(),
  username: z.string(),
  kind: z.union([z.literal("user"), z.literal("patient")])
});

export type Session = z.infer<typeof schemaSession>;

export const unsealData = async (data: string): Promise<Session> => {
  return ironUnsealData(data, ironSessionConfig);
};

export const sealData = async (data: Session) => {
  return ironSealData(data, ironSessionConfig);
};

export async function contextSetSession(
  context: TRPCContext,
  session: Session | null,
) {
  context.cookies.setCookie(
    SESSION_COOKIE,
    session ? await sealData(session) : "",
    `Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`,
  );
}
