import express, { Request, Response } from 'express';
import { errorMiddleware } from './middleware/error.middleware';
import widgetRoute from './routes/widget.route'

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

app.use("/api/widget", widgetRoute);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
