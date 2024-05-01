/* eslint-disable @typescript-eslint/no-floating-promises */

import {
  addDays,
  addWeeks,
  differenceInDays,
  format,
  getDate,
  getDay,
  getMonth,
  getYear,
  subWeeks,
} from "date-fns";
import { patient, schedule } from "../src/server/db/schema";
import { WORK_END_HOUR, WORK_START_HOUR } from "~/lib/constants";

// yeah these are kinda weird
(await import("dotenv")).config();
const {
  default: { hash },
} = await import("bcryptjs");
const { db } = await import("../src/server/db");
const { users } = await import("../src/server/db/schema");

function choice<T>(list: T[]): T {
  const chosen = list[Math.round(Math.random() * (list.length - 1))];
  if (!chosen) throw new Error("unreachable");
  return chosen;
}

async function main() {
  await db.transaction(async (t) => {
    await t.insert(users).values({
      username: "user",
      password: await hash("p4ssw0rd", 12),
    });

    // create patients
    const patients = [];
    for (let a = 0; a < 10; a++) {
      patients.push(
        // biome-ignore lint/style/noNonNullAssertion: this is intentional
        (
          await db
            .insert(patient)
            .values({
              username: `patient_${a}`,
              password: await hash(`password${a}`, 12),
            })
            .returning()
        )[0]!,
      );
    }

    // create quite some schedules
    const today = new Date();
    const startDate = subWeeks(today, 4);
    const endDate = addWeeks(today, 4);

    for (let day = 0; day < differenceInDays(endDate, startDate); day++) {
      const thisDay = addDays(startDate, day);
      let hour = WORK_START_HOUR;
      while (hour < WORK_END_HOUR) {
        let newHour = hour + choice([1, 2, 3]);
        if (WORK_END_HOUR < newHour) newHour = WORK_END_HOUR;

        const type = choice(["break", "appointment", "empty"]);
        if (type !== "empty") {
          await db.insert(schedule).values({
            dateYear: getYear(thisDay),
            dateMonth: getMonth(thisDay),
            dateDay: getDate(thisDay),
            startHour: hour,
            startMinute: 0,
            endHour: newHour,
            endMinute: 0,
            isBreak: type === "break",
            patientId: type === "appointment" ? choice(patients).id : null,
            title: type === "appointment" ? `appointment ${day}` : null,
            status: "appointed",
          });
        }
        console.log(
          `inserted ${type} on ${format(
            thisDay,
            "yyyy-MM-dd",
          )} at ${hour}:00-${newHour}:00`,
        );

        hour = newHour;
      }
    }
  });
}

main().then(() => console.log("Database seeded successfully."));
