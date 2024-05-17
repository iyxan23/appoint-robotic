import express from "express";
import { nanoid } from "nanoid";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { schemaCheckInUpdate, schemaScheduleUpdate } from "./schemas.js";
import { createHash } from "node:crypto";
import { config } from "dotenv";
import cors from "cors";

config();

const app = express();
const server = createServer(app);

const io = new Server(server, { cors: { origin: "*" } });
const port = process.env["PORT"] || 3333;

if (!process.env["SECRET"]) {
  throw new Error("SECRET is not provided");
}

const SECRET = process.env["SECRET"];

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.write("Hello world!");
  res.end();
});

function sendDataToUsers(data) {
  socket.to("user").emit(data.type, data.data);
}

function sendDataToPatient(data, patientId) {
  socket.to(`patient-${patientId}`).emit(data.type, data.data);
}

function hash(input) {
  return createHash("sha256").update(input, "binary").digest("hex");
}

async function verifyToken(token) {
  const payload = { token, nonce: nanoid() };

  return fetch(
    `${process.env["BACKEND_HOST"]}/api/scheduleStream/verifyToken`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        challange: hash(JSON.stringify(payload) + SECRET),
      }),
    },
  ).then((res) => res.json());
}

io.on("connection", (socket) => {
  const id = nanoid();
  console.log(`Client connected: ${id}`);

  socket.on("login", (token) => {
    if (typeof token !== "string") return;
    console.log(`Login: ${token}`);
    verifyToken(token).then((data) => {
      if (data.valid) {
        console.log(`login is valid: ${JSON.stringify(data)}`);

        if (data.kind.type === "user") {
          socket.join("user");
        } else {
          socket.join(`patient-${data.kind.id}`);
        }
      } else {
        console.log("invalid");
        socket.disconnect(true);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${id}`);
  });
});

app.post("/broadcast/scheduleUpdate", async (req, res) => {
  let parsed;
  try {
    parsed = await schemaScheduleUpdate.parseAsync(req.body);
  } catch (e) {
    res.status(400).json({ status: "err", message: "Invalid request" });
    return;
  }

  // verify challange
  const challangeResp = parsed.challange;
  const reqBody = JSON.stringify({ ...parsed, challange: undefined });

  const challangePassed = challangeResp === hash(reqBody + SECRET);

  if (!challangePassed) {
    res.status(400).json({ status: "err", message: "Challange failed" });
    return;
  }

  sendDataToUsers({
    type: "scheduleUpdate",
    data: { ...parsed, challange: undefined },
  });
  res.status(200).json({ status: "ok", message: "sent" });
});

app.post("/broadcast/checkInUpdate", async (req, res) => {
  let parsed;
  try {
    parsed = await schemaCheckInUpdate.parseAsync(req.body);
  } catch (e) {
    res.status(400).json({ status: "err", message: "Invalid request" });
    return;
  }

  // verify challange
  const challangeResp = parsed.challange;
  const reqBody = JSON.stringify({ ...parsed, challange: undefined });

  const challangePassed = challangeResp === hash(reqBody + SECRET);

  if (!challangePassed) {
    res.status(400).json({ status: "err", message: "Challange failed" });
    return;
  }

  sendDataToUsers({
    type: "checkInUpdate",
    data: { ...parsed, challange: undefined },
  });
  sendDataToPatient(
    { type: "checkInUpdate", data: { ...parsed, challange: undefined } },
    parsed.patientId,
  );

  res.status(200).json({ status: "ok", message: "sent" });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
