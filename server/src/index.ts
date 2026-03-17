import dotenv from 'dotenv'
import express, { Request, Response } from 'express';
import cors from 'cors';
import { errorMiddleware } from './middleware/error.middleware';
import widgetRoute from './routes/widget.route'
import path from 'path';
import controlRoute from './routes/control.route'

import { Server } from 'socket.io';
import { createServer } from 'node:http';
import { ITrackState } from '../../shared/models/ITrackState';
import { ITrack } from '../../shared/models/ITrack';

dotenv.config();
const PORT = process.env.PORT ?? 3000;

const app = express();

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

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
});
io.on('connection', socket => {

  const audioPath = '/audio/playlist';
  const coverPath = '/img/cover/stadler.jpg';

  const dummyData: ITrackState = {
    currentTrack: {
      title   : 'Tiger',
      artist  : 'D.I.P',
      audioUrl: `${audioPath}/Tiger.mp3`,
      coverUrl: coverPath
    },
    nextTrack: {
      title   : 'Ey Kirchheim',
      artist  : 'D.I.P',
      audioUrl: `${audioPath}/Ey Kirchheim.mp3`,
      coverUrl: coverPath
    },
    trackTime: 0
  };

  socket.emit('trackStateChange', JSON.stringify(dummyData));
});

httpServer.listen(8080);