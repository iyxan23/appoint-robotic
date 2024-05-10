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

function sendData(data) {
  for (const id in listeners) {
    listeners[id](data);
  }
}

function hash(input) {
  return createHash('sha256').update(input, 'binary').digest('hex');
}

io.on('connection', (socket) => {
  const id = nanoid();
  console.log(`Client connected: ${id}`);

  listeners[id] = async (data) => {
    console.log(`Emitting data: ${data}`);
    socket.emit('data', data);
  };

  socket.on('disconnect', () => {
    delete listeners[id];
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

  sendData({ type: "scheduleUpdate", data: parsed });
  res.status(200).json({ status: "ok", message: "sent" });
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
