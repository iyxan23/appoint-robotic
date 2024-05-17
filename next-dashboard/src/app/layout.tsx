import "~/styles/globals.css";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/sonner";
import SocketIoProvider from "~/lib/socket/SocketIoProvider";
import { env } from "~/env";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Appoint",
  description: "A System of Managing Appointments",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <TRPCReactProvider>
          <SocketIoProvider url={env.SCHEDULE_STREAM_HOST}>{children}</SocketIoProvider>
        </TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  );
}
