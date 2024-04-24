"use client";

import {
  CalendarIcon,
  HomeIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SELECTED_CLASSNAME =
  "flex items-center gap-3 rounded-lg bg-gray-100 px-3 py-2 text-gray-900 transition-all hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50";
const UNSELECTED_CLASSNAME =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50";

const navigation = [
  {
    title: "Home",
    icon: () => <HomeIcon className="h-4 w-4"/>,
    href: "/dashboard"
  },
  {
    title: "Schedule",
    icon: () => <CalendarIcon className="h-4 w-4"/>,
    href: "/dashboard/schedule"
  },
  {
    title: "Patients",
    icon: () => <UsersIcon className="h-4 w-4"/>,
    href: "/dashboard/patients"
  }
]

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start px-4 text-sm font-medium">
      {navigation.map((item) => (
        <Link
          className={pathname === item.href ? SELECTED_CLASSNAME : UNSELECTED_CLASSNAME}
          href={item.href}
          key={item.title}
        >
          {item.icon()}
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
