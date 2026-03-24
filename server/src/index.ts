import dotenv from 'dotenv'
import express, { Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { errorMiddleware } from './middleware/error.middleware';
import widgetRoute from './routes/widget.route'
import path from 'path';
import controlRoute from './routes/control.route'

dotenv.config();
const PORT = process.env.PORT ?? 3000;

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

// const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
//   .split(',')
//   .map(o => o.trim());

app.use(cors());
// app.use(cors({
//   origin: (origin, callback) => {
//     // Allow requests with no origin (e.g. curl, mobile apps)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) return callback(null, true);
//     callback(new Error(`CORS: origin '${origin}' not allowed`));
//   },
//   credentials: true,
// }));

app.use(express.static(path.join(__dirname, '../public')))

app.use(express.json());

app.use("/api/widget", widgetRoute);
app.use("/api/control", controlRoute);

app.use(errorMiddleware);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
