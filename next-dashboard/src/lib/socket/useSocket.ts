import { useContext } from "react";
import { SocketIoContext } from "./SocketIoProvider";
import type { io } from "socket.io-client";

export default function useSocket(): ReturnType<typeof io> {
  const socket = useContext(SocketIoContext);

  if (socket === null) {
    if (typeof window === "undefined") {
      return null as unknown as ReturnType<typeof io>;
    }

    throw new Error("There is no SocketIoProvider");
  }

  return socket;
}
