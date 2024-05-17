import { useQuery } from "@tanstack/react-query";
import type { TimeFaker } from "~/lib/timeFaker";

// a hook that returns a mocked "now" from the time-faker server
// if it is specified to do so (check env)
export default function useStubbedNow(time: TimeFaker | null): { now: Date } {
  const { data } = useQuery({
    queryKey: ["now"],
    // biome-ignore lint/style/noNonNullAssertion: enabled: time !== undefined
    queryFn: async () => time!.getTime(),
    staleTime: 1000,
    enabled: time != null,
  });

  return { now: time ? data ?? new Date() : new Date() };
}
