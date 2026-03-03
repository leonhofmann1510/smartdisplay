import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { errorMiddleware } from './middleware/error.middleware';
import widgetRoute from './routes/widget.route'

const app = express();
const PORT = process.env.PORT ?? 3000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
}));

app.use(express.json());

app.use("/api/widget", widgetRoute);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
