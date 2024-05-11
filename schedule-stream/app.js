import express from 'express';
import { nanoid } from 'nanoid';
import { createServer } from 'node:http';
import { Server } from "socket.io";
import { schemaScheduleUpdate } from "./schemas.js";
import { createHash } from "node:crypto";
import { config } from "dotenv";

config();

const app = express()
const server = createServer(app);

const io = new Server(server);
const port = process.env["PORT"] || 3333

if (!process.env["SECRET"]) {
  throw new Error("SECRET is not provided");
}

const SECRET = process.env["SECRET"];

app.use(express.json())

app.get("/", (req, res) => {
  res.write("Hello world!");
  res.end();
})

const listeners = {};

function sendDataToUsers(data) {
  for (const id in listeners) {
    if (listeners[id].patientId) {
      continue;
    }
    listeners[id].emit(data);
  }
}

function hash(input) {
  return createHash('sha256').update(input, 'binary').digest('hex');

async function verifyToken(token) {
  const payload = { token, nonce: nanoid() };

  return fetch(
    `${process.env["BACKEND_HOST"]}/api/open/scheduleStream/verifyToken`,
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

io.on('connection', (socket) => {
  const id = nanoid();
  console.log(`Client connected: ${id}`);

  socket.on("login", (token) => {
    console.log(`Login: ${token}`);
    verifyToken(token).then((data) => {
      if (data.valid) {
        console.log(`login is valid: ${JSON.stringify(data)}`);

        if (data.kind.type === "user") {
          listeners[id] = {
            emit: async (data) => {
              console.log(`Emitting data to user: ${data}`);
              socket.emit("data", data);
            },
          };
        } else {
          listeners[id] = {
            patientId: data.kind.id,
            emit: async (data) => {
              console.log(
                `Emitting data to patient with id ${data.kind.id}: ${data}`,
              );
              socket.emit("data", data);
            },
          };
        }
      } else {
        socket.disconnect(true);
      }
    });
  });

  socket.on("disconnect", () => {
    if (listeners[id]) {
      delete listeners[id];
    }

    console.log(`Client disconnected: ${id}`);
  });
});

app.post('/broadcast/scheduleUpdate', async (req, res) => {
  let parsed;
  try {
    parsed = await schemaScheduleUpdate.parseAsync(req.body);
  } catch (e) {
    res.status(400).json({ status: "err", message: "Invalid request" })
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

  sendDataToUsers({ type: "checkInUpdate", data: parsed });
  res.status(200).json({ status: "ok", message: "sent" });
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
