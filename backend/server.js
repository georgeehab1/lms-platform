import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js'; 
import courseRoutes from './routes/courseRoutes.js';
import quizRoutes from './routes/quizRoutes.js'; 
import progressRoutes from './routes/progressRoutes.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', quizRoutes); 
app.use('/api/progress', progressRoutes);


app.get('/', (req, res) => {
  res.send('LMS API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;