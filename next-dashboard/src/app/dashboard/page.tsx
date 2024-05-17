import { env } from "~/env";
import MainDashboardDisplay from "./MainDashboardDisplay";
import WelcomeBack from "./WelcomeBack";
import SocketIoLogin from "./SocketIoLogin";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "~/server/session";

export default function DashboardPage() {
  const token = cookies().get(SESSION_COOKIE)?.value;

  return (
    <main className="flex flex-1 flex-col gap-2 p-4 md:gap-4 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">
          <WelcomeBack />
        </h1>
      </div>
      <MainDashboardDisplay timeFakerHost={env.TIME_FAKER_USE ? env.TIME_FAKER_HOST : undefined} />

      {/* biome-ignore lint/style/noNonNullAssertion: user should be logged in to be able to enter dashboard */}
      <SocketIoLogin token={token!} />
    </main>
  );
}
