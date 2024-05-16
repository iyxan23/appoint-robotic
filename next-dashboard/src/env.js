import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    IRON_SESSION_PASSWORD: z.string(),
    SESSION_MAX_AGE: z.coerce.number().optional(),
    SCHEDULE_STREAM_HOST: z.string(),
    SCHEDULE_STREAM_SECRET: z.string(),
    NFC_READER_SECRET: z.string(),

    TIME_FAKER_HOST: z.string(),
    TIME_FAKER_USE: z.boolean()
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
    IRON_SESSION_PASSWORD: process.env.IRON_SESSION_PASSWORD,
    SESSION_MAX_AGE: process.env.SESSION_MAX_AGE,
    SCHEDULE_STREAM_HOST: process.env.SCHEDULE_STREAM_HOST,
    SCHEDULE_STREAM_SECRET: process.env.SCHEDULE_STREAM_SECRET,
    NFC_READER_SECRET: process.env.NFC_READER_SECRET,

    TIME_FAKER_HOST: process.env.TIME_FAKER_HOST,
    TIME_FAKER_USE: process.env.TIME_FAKER_USE
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
