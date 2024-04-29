import { type NextRequest, NextResponse } from "next/server";
import { openApiDocument } from "~/server/api/openapi";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const openApiDoc = openApiDocument();

  // only specify the port if the port is not the default port of said protocol
  const port =
    req.nextUrl.port !== getPortFromProtocol(req.nextUrl.protocol)
      ? `:${req.nextUrl.port}`
      : "";

  const openApiDocWithUrl = {
    ...openApiDoc,
    servers: [
      {
        url: `${req.nextUrl.protocol}//${req.nextUrl.hostname}${port}/api`,
      },
    ],
  };

  return NextResponse.json(openApiDocWithUrl);
}

function getPortFromProtocol(protocol: string): string | null {
  return protocol === "http" ? "80" : protocol === "https" ? "443" : null;
}
