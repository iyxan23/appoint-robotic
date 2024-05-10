import { ScheduleStream } from "./scheduleStream";
import { env } from "~/env.js";

export const notifier: ScheduleStream = new ScheduleStream(
  env.SCHEDULE_STREAM_HOST,
  env.SCHEDULE_STREAM_SECRET,
);
