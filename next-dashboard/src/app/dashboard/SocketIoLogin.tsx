"use client";

import { useEffect } from "react";
import useSocket from "~/lib/socket/useSocket";

export default function SocketIoLogin({ token }: { token: string }) {
  const socket = useSocket();

  useEffect(() => {
    console.log(`logging in with ${token}`);
    socket.emit("login", token);
  });

  return <></>;
}
