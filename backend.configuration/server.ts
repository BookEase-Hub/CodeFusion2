import express from 'express';
import cors from 'cors';
import fileRoutes from './routes/fileRoutes';
import aiRoutes from './routes/aiRoutes';
import projectRoutes from './routes/projectRoutes';
import terminalRoutes from './routes/terminalRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/files', fileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/terminal', terminalRoutes);

app.listen(PORT, () => {
  console.log(Server running on http://localhost:${PORT});
});