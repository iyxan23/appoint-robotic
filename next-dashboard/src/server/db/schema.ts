// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import { index, int, sqliteTableCreator, text } from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator(
  (name) => `next-dashboard_${name}`,
);

export const users = createTable("user", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),

  username: text("username", { length: 256 }).notNull(),
  password: text("password", { length: 256 }).notNull(),

  createdAt: int("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

export const patient = createTable("patient", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),

  username: text("username", { length: 256 }).notNull(),
  password: text("password", { length: 256 }).notNull(),

  createdAt: int("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

export const schedule = createTable("schedule", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),

  dateYear: int("date_year", { mode: "number" }).notNull(),
  dateMonth: int("date_mon", { mode: "number" }).notNull(),
  dateDay: int("date_day", { mode: "number" }).notNull(),

  startHour: int("start_h", { mode: "number" }).notNull(),
  startMinute: int("start_m", { mode: "number" }).notNull(),

  endHour: int("end_h", { mode: "number" }).notNull(),
  endMinute: int("end_m", { mode: "number" }).notNull(),

  // if isBreak is true, then the fields below is_break shall be null, and otherwise
  isBreak: int("is_break", { mode: "boolean" }).notNull(),

  patientId: int("patient_id"),
  title: text("title", { length: 256 }),
  status: text("status", {
    enum: ["appointed", "checked-in", "in-progress", "finished"],
  }),

  createdAt: int("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

export const schedulePatientRelations = relations(schedule, ({ one }) => ({
  patient: one(patient, {
    fields: [schedule.patientId],
    references: [patient.id],
  }),
}));

export const posts = createTable(
  "post",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name", { length: 256 }).unique(),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  }),
);

export const checkin = createTable("checkin", {
  // uuid
  id: text("id", { length: 36 }).primaryKey(),

  patientId: int("patient_id"),
  scheduleId: int("schedule_id"),
});

export const checkinPatientRelations = relations(checkin, ({ one }) => ({
  patient: one(patient, {
    fields: [checkin.patientId],
    references: [patient.id],
  }),
}));

export const checkinScheduleRelations = relations(checkin, ({ one }) => ({
  schedule: one(schedule, {
    fields: [checkin.scheduleId],
    references: [schedule.id],
  }),
}));
