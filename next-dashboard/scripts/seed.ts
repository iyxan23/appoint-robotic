/* eslint-disable @typescript-eslint/no-floating-promises */

// yeah these kinda weird
(await import("dotenv")).config();
const {
  default: { hash },
} = await import("bcryptjs");
const { db } = await import("../src/server/db");
const { users } = await import("../src/server/db/schema");

async function main() {
  await db.transaction(async (t) => {
    await t.insert(users).values({
      username: "user",
      password: await hash("p4ssw0rd", 12),
    });
  });
}

main().then(() => console.log("Database seeded successfully."));
