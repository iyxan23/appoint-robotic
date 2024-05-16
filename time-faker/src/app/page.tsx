import TimeChanger from "./TimeChanger";

export default function Home() {
  return (
    <main className="flex flex-col justify-center items-center min-h-screen min-w-screen">
      <div className="p-6 rounded-md shadow-md flex flex-col gap-4 min-w-[10rem]">
        <h1 className="text-xl font-bold">Ubah waktu</h1>

        <TimeChanger />
      </div>
    </main>
  );
}
