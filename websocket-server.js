import { createServer } from "http"
import { Server } from "socket.io"

const port = 3002
const hostname = "localhost"

// Create a simple HTTP server
const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" })
  res.end("WebSocket server is running")
})

// Initialize Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// Handle socket connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id)

  // Handle new cases uploaded event
  socket.on("new-cases-uploaded", (data) => {
    console.log("New cases uploaded:", data)
    // Broadcast to all connected clients
    io.emit("new-case", {
      disease_name: "Multiple cases",
      count: data.count,
      message: data.message
    })
  })

  // Handle new alerts
  socket.on("new-alert", (data) => {
    console.log("New alert:", data)
    // Broadcast to all connected clients
    io.emit("new-alert", data)
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

server.listen(port, () => {
  console.log(`> WebSocket server ready on http://${hostname}:${port}`)
})