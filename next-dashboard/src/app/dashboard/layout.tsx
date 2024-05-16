import {
  CalendarCheckIcon,
  CalendarIcon,
  HomeIcon,
  Package2Icon,
  SearchIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { Input } from "~/components/ui/input";
import UserProfileDropdown from "./UserProfileDropdown";
import Navigation from "./Navigation";

export default function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <Link className="flex items-center gap-2 font-semibold" href="#">
              <Package2Icon className="h-6 w-6" />
              <span className="">Appoint</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <Navigation />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
          <Link className="lg:hidden" href="#">
            <Package2Icon className="h-6 w-6" />
            <span className="sr-only">Home</span>
          </Link>
          <div className="w-full flex-1">
          </div>
          <UserProfileDropdown />
        </header>
        {children}
      </div>
    </div>
  );
}
