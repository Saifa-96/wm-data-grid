import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";
import { OperationalTransformation } from "./ot/ot";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const ot = new OperationalTransformation();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

io.on("connection", (socket) => {
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("init", (msg) => {
    io.emit("init", ot.getDataByPage(1));
  });

  socket.on("next-page", (payload) => {
    const { rows, total } = ot.getDataByPage(payload.page);
    io.emit("next-page", { rows, total });
  });
});

server.listen(3009, () => {
  console.log("server running at http://localhost:3009");
});
