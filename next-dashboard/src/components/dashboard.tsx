import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenu,
} from "~/components/ui/dropdown-menu";
import {
  BellIcon,
  CalendarCheckIcon,
  CalendarIcon,
  CircleIcon,
  HomeIcon,
  Package2Icon,
  SearchIcon,
  UsersIcon,
} from "lucide-react";

export function Dashboard() {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <Link className="flex items-center gap-2 font-semibold" href="#">
              <Package2Icon className="h-6 w-6" />
              <span className="">Acme Inc</span>
            </Link>
            <Button className="ml-auto h-8 w-8" size="icon" variant="outline">
              <BellIcon className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              <Link
                className="flex items-center gap-3 rounded-lg bg-gray-100 px-3 py-2 text-gray-900  transition-all hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50"
                href="#"
              >
                <HomeIcon className="h-4 w-4" />
                Home
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="#"
              >
                <CalendarIcon className="h-4 w-4" />
                Schedule
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="#"
              >
                <UsersIcon className="h-4 w-4" />
                Patients
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="#"
              >
                <CalendarCheckIcon className="h-4 w-4" />
                Appointments
              </Link>
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Upgrade to Pro</CardTitle>
                <CardDescription>
                  Unlock all features and get unlimited access to our support
                  team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="sm">
                  Upgrade
                </Button>
              </CardContent>
            </Card>
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
            <form>
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  className="w-full bg-white shadow-none appearance-none pl-8 md:w-2/3 lg:w-1/3 dark:bg-gray-950"
                  placeholder="Search products..."
                  type="search"
                />
              </div>
            </form>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="rounded-full border border-gray-200 w-8 h-8 dark:border-gray-800"
                size="icon"
                variant="ghost"
              >
                <img
                  alt="Avatar"
                  className="rounded-full"
                  height="32"
                  src="/placeholder.svg"
                  style={{
                    aspectRatio: "32/32",
                    objectFit: "cover",
                  }}
                  width="32"
                />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <div className="flex items-center">
            <h1 className="font-semibold text-lg md:text-2xl">Schedule</h1>
            <Button className="ml-auto" size="sm">
              New Appointment
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Today&apos;s Schedule
                </CardTitle>
                <Button>Add Appointment</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CircleIcon className="h-3 w-3 text-green-500" />
                    <div className="font-medium">10:00 AM</div>
                    <div className="text-gray-500 dark:text-gray-400">-</div>
                    <div className="font-medium">11:00 AM</div>
                    <div className="ml-auto font-semibold">Consultation</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleIcon className="h-3 w-3 text-green-500" />
                    <div className="font-medium">11:30 AM</div>
                    <div className="text-gray-500 dark:text-gray-400">-</div>
                    <div className="font-medium">12:30 PM</div>
                    <div className="ml-auto font-semibold">Lunch Break</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleIcon className="h-3 w-3 text-gray-500" />
                    <div className="font-medium">1:00 PM</div>
                    <div className="text-gray-500 dark:text-gray-400">-</div>
                    <div className="font-medium">2:00 PM</div>
                    <div className="ml-auto font-semibold">Available</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleIcon className="h-3 w-3 text-gray-500" />
                    <div className="font-medium">2:30 PM</div>
                    <div className="text-gray-500 dark:text-gray-400">-</div>
                    <div className="font-medium">3:30 PM</div>
                    <div className="ml-auto font-semibold">Available</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleIcon className="h-3 w-3 text-gray-500" />
                    <div className="font-medium">4:00 PM</div>
                    <div className="text-gray-500 dark:text-gray-400">-</div>
                    <div className="font-medium">5:00 PM</div>
                    <div className="ml-auto font-semibold">Available</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Upcoming Appointments
                </CardTitle>
                <Button>Add Appointment</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CircleIcon className="h-3 w-3 text-gray-500" />
                    <div className="font-medium">10:00 AM</div>
                    <div className="text-gray-500 dark:text-gray-400">-</div>
                    <div className="font-medium">11:00 AM</div>
                    <div className="ml-auto font-semibold">Consultation</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleIcon className="h-3 w-3 text-gray-500" />
                    <div className="font-medium">11:30 AM</div>
                    <div className="text-gray-500 dark:text-gray-400">-</div>
                    <div className="font-medium">12:30 PM</div>
                    <div className="ml-auto font-semibold">Lunch Break</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleIcon className="h-3 w-3 text-gray-500" />
                    <div className="font-medium">1:00 PM</div>
                    <div className="text-gray-500 dark:text-gray-400">-</div>
                    <div className="font-medium">2:00 PM</div>
                    <div className="ml-auto font-semibold">Available</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleIcon className="h-3 w-3 text-gray-500" />
                    <div className="font-medium">2:30 PM</div>
                    <div className="text-gray-500 dark:text-gray-400">-</div>
                    <div className="font-medium">3:30 PM</div>
                    <div className="ml-auto font-semibold">Available</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleIcon className="h-3 w-3 text-gray-500" />
                    <div className="font-medium">4:00 PM</div>
                    <div className="text-gray-500 dark:text-gray-400">-</div>
                    <div className="font-medium">5:00 PM</div>
                    <div className="ml-auto font-semibold">Available</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
