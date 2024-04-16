"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { redirect, useRouter } from "next/navigation";

const formSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export default function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { refresh } = useRouter();
  const { mutate, isPending } = api.session.login.useMutation({
    onSuccess: (res) => {
      if (res.success) {
        refresh();
      } else {
        form.setError("username", { message: res.reason });
        form.setError("password", { message: res.reason });
      }
    },
    onError: (err) => {
      form.setError("username", { message: `Internal error: ${err.message}` });
      form.setError("password", { message: `Internal error: ${err.message}` });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          mutate({ username: data.username, password: data.password });
        })}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="username"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" type="submit">
          Login
        </Button>
      </form>
    </Form>
  );
}
