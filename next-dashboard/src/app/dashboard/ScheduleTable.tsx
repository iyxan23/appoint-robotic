"use client";

import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { cn } from "~/lib/utils";

type Time = {
  hour: number;
  minute: number;
}

function formatTime(time: Time): string {
  return `${time.hour >= 10 ? time.hour : `0${time.hour}`}:${time.minute >= 10 ? time.minute : `0${time.minute}`}`
}

type ScheduleItem = {
  type: "appointment",

  start: Time,
  end: Time,

  patient: string,
  title: string,

  status: "cancelled" | "finished" | "in-progress" | "checked-in" | "appointed"
} | {
  type: "break",

  start: Time,
  end: Time,
}

const columnHelper = createColumnHelper<ScheduleItem>()
const columns = [
  columnHelper.accessor(row => `${formatTime(row.start)} - ${formatTime(row.end)}`, {
    id: "time",
    header: "Jadwal"
  }),
  columnHelper.accessor("type", {
    header: "Tipe",
    cell: r => r.getValue() === "appointment" ? "Janji Temu" : "Istirahat",
  }),
  columnHelper.accessor(row => row.type === "appointment" ? row.patient : null, {
    id: "patient",
    header: "Pasien",
  }),
  columnHelper.accessor(row => row.type === "appointment" ? row.title : null, {
    header: "Perihal"
  }),
  columnHelper.accessor(row => row.type === "appointment" ? row.status : null, {
    id: "status",
    header: "Status",
    cell: r => {
      const val = r.getValue();
      if (val == null) return null;

      return ({
        appointed: "Terjadwal",
        "checked-in": "Telah cek-in",
        cancelled: "Dibatalkan",
        "in-progress": "Sedang Ditangani",
        finished: "Selesai",
      })[val];
    }
  })
]

export default function ScheduleTable({ data }: { data: ScheduleItem[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={cn(row.getValue("type") === "break" && "bg-muted hover:bg-muted")}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
