"use client";

import { createContext, useState } from "react";
import { io } from "socket.io-client";

export const SocketIoContext = createContext<ReturnType<typeof io> | null>(
  null,
);

export default function SocketIoProvider({
  children,
  url,
}: { children: React.ReactNode; url: string }) {
  const [socketIo] = useState(() =>
    typeof window !== "undefined" ? io(url) : null,
  );

  return (
    <SocketIoContext.Provider value={socketIo}>
      {children}
    </SocketIoContext.Provider>
  );
}
