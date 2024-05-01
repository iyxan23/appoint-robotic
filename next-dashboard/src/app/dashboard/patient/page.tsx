import PatientDisplay from "./PatientDisplay";

export default function PatientPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-4 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Pasien</h1>
      </div>
      <PatientDisplay />
    </main>
  );
}
