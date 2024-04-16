import { cache } from "react";
import { appRouter } from "./root";
import { generateOpenApiDocument } from "trpc-openapi";

export const openApiDocument = cache(() =>
  generateOpenApiDocument(appRouter, {
    title: "Appoint API",
    description:
      "Developer Appoint API reference, originally built with tRPC.",
    version: "1.0.0",
    baseUrl: "http://localhost/api",
  }),
);
