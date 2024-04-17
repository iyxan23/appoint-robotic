// this simple middleware's only job is to check if the requests
// coming through dashboard are authenticated.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE, unsealData } from '~/server/session'

// This function can be marked `async` if using `await` inside
export default async function middleware(request: NextRequest): Promise<NextResponse> {
  console.log(`${request.url} intercepted by middleware`);
  const session = request.cookies.get(SESSION_COOKIE);

  if (!session) {
    return NextResponse.redirect(`${request.nextUrl.protocol}//${request.nextUrl.host}/login`);
  }

  if (!session.value) {
    return NextResponse.redirect(`${request.nextUrl.protocol}//${request.nextUrl.host}/login`);
  }

  // check if it is valid
  try {
    await unsealData(session.value);
  } catch (e) {
    // TODO - probably check whether the error is coming from iron-session itself
    const response = NextResponse.redirect(`${request.nextUrl.protocol}//${request.nextUrl.host}/login`);
    response.cookies.set(SESSION_COOKIE, "");

    return response;
  }

  return NextResponse.next();
}

// only happens on /dashboard
export const config = {
  matcher: '/dashboard(.*)',
}
