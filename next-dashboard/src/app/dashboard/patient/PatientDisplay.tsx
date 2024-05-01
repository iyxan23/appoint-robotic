"use client";

import { api } from "~/trpc/react";
import PatientTable from "./PatientTable";

export default function PatientDisplay() {
  const { data } = api.patient.listPatients.useQuery();

  return <div>{data && <PatientTable data={data} />}</div>;
}
