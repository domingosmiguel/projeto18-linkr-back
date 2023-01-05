import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import usersRouter from './routes/users.routes.js';
import postRoute from "./routes/postsRoutes.js"

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.use(usersRouter);
app.use(postRoute);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server runnig in port ${PORT}`);
});
