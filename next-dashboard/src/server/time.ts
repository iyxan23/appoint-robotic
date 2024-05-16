import { env } from "~/env";
import { TimeFaker } from "./timeFaker";

const theGlobal = globalThis as unknown as { timeFaker: TimeFaker };
theGlobal.timeFaker = new TimeFaker(env.TIME_FAKER_HOST);

export const time = theGlobal.timeFaker;
