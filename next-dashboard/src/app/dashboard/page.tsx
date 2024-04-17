import ScheduleDisplay from "./ScheduleDisplay";
import WelcomeBack from "./WelcomeBack";

export default function DashboardPage() {
  return <main className="flex flex-1 flex-col gap-2 p-4 md:gap-4 md:p-6">
    <div className="flex items-center">
      <h1 className="font-semibold text-lg md:text-2xl"><WelcomeBack /></h1>
    </div>
    <ScheduleDisplay />
  </main>
}
