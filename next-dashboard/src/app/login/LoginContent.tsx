import { api } from "~/trpc/server";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

// separating this check because better TTFB rather than making it block the entire page from loading.
export default async function LoginContent() {
  const session = await api.session.getSession();
  console.log(session);

  if (session) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
