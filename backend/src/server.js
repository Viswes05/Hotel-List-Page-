require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { UPLOAD_DIR } = require('./middleware/upload');
const hotelRoutes = require('./routes/hotels');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/hotels', hotelRoutes);

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError || err.message?.startsWith('Only JPG')) {
    return res.status(400).json({ message: 'Validation failed', errors: { image: err.message } });
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
