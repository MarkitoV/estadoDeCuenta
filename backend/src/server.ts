import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import morgan from 'morgan';

import movimientoRoutes from './routes/movimientoRoutes';

dotenv.config();

const app = express();
const PORT = 3000;
const MONGO_URL = 'mongodb://127.0.0.1:27017/estado_cuenta_db';

// Configure morgan to log to stderr (console.error) to avoid buffering issues
app.use(morgan('dev', {
  stream: { write: (message) => console.error(message.trim()) }
}));
app.use(express.json());
app.use('/api/movimientos', movimientoRoutes);

const startServer = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB at', MONGO_URL);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

startServer();
