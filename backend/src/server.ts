import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import movimientoRoutes from './routes/movimientoRoutes';

dotenv.config();

const app = express();
const PORT = 3000;
const MONGO_URL = 'mongodb://localhost:27017/estado_cuenta_db';

app.use(express.json());
app.use('/api/movimientos', movimientoRoutes);

const startServer = async () => {
  try {
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
