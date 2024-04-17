"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { api } from "~/trpc/react";

export default function UserProfileDropdown() {
  const { refresh } = useRouter();
  const { data: session } = api.session.getSession.useQuery();
  const { mutate: logout } = api.session.logout.useMutation({
    onSuccess: () => {
      refresh();
    },
    onError: (err) => {
      console.error(err);
      toast(`Error: ${err.message}`);
    },
  });

  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        className="rounded-full border border-gray-200 w-8 h-8 dark:border-gray-800"
        size="icon"
        variant="ghost"
      >
        <Avatar>
          <AvatarImage src="http://nonexistent" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <span className="sr-only">Toggle user menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Akun: {session?.username}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="text-red-500" onClick={() => logout()}>Logout</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
}
