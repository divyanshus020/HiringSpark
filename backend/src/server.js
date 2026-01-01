import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());
app.use(cors());

// Basic route
app.get('/', (req, res) => {
  res.send('Hello World! Server is running.');
});

// Start the server
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});