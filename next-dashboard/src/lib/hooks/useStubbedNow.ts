import { useQuery } from "@tanstack/react-query";
import { time } from "~/server/time";

// a hook that returns a mocked "now" from the time-faker server
// if it is specified to do so (check env)
export default function useStubbedNow(): { now: Date } {
  const { data } = useQuery({ queryKey: ["now"], queryFn: async () => time.getTime(), staleTime: 1000 });

  return { now: data ?? new Date() };
}
