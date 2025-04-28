// src/app.ts
import express from 'express';
import commandRoutes from './routes/commandRoutes';

const app = express();
app.use(express.json());

app.use('/api', commandRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(Server is running on port ${PORT});
});