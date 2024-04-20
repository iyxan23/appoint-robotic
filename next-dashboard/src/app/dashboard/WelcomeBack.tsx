import { api } from "~/trpc/server";

export default async function WelcomeBack() {
  const session = await api.session.getSession();

  if (!session) throw new Error("Session must not be null");

  return <>Selamat datang kembali, {session.username}</>;
}
