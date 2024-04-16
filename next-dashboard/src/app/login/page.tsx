import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import LoginContent from "./LoginContent";
import { Skeleton } from "~/components/ui/skeleton";
import { Suspense } from "react";

export default async function LoginPage() {
  return (
    <main className="min-w-screen flex min-h-screen items-center justify-center">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Enter your user credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense
            fallback={
              <div className="flex w-full flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: then what else
                  <Skeleton key={i} className="h-8 w-full rounded-md" />
                ))}
              </div>
            }
          >
            <LoginContent />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
