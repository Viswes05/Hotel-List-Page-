const express = require('express');
const pool = require('../db');
const { upload, removeImage } = require('../middleware/upload');
const { validateHotel } = require('../middleware/validate');

const router = express.Router();

const COLUMNS = `id, title, description, image_path, latitude::float8 AS latitude,
  longitude::float8 AS longitude, price::float8 AS price, created_at, updated_at`;

const toImageUrl = (filename) => (filename ? `/uploads/${filename}` : null);

// ---------- GET /api/hotels?search=&minPrice=&maxPrice=&offset=0&limit=6 ----------
router.get('/', async (req, res, next) => {
  try {
    const { search, minPrice, maxPrice } = req.query;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 50);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const where = [];
    const params = [];

    if (search && String(search).trim()) {
      params.push(`%${String(search).trim()}%`);
      where.push(`title ILIKE $${params.length}`);
    }
    if (minPrice !== undefined && minPrice !== '' && !Number.isNaN(Number(minPrice))) {
      params.push(Number(minPrice));
      where.push(`price >= $${params.length}`);
    }
    if (maxPrice !== undefined && maxPrice !== '' && !Number.isNaN(Number(maxPrice))) {
      params.push(Number(maxPrice));
      where.push(`price <= $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM hotels ${whereSql}`, params);

    const listParams = [...params, limit, offset];
    const listResult = await pool.query(
      `SELECT ${COLUMNS} FROM hotels ${whereSql}
       ORDER BY created_at DESC, id DESC
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );

    res.json({
      data: listResult.rows,
      total: countResult.rows[0].total,
      limit,
      offset,
    });
  } catch (err) {
    next(err);
  }
});

// ---------- GET /api/hotels/:id ----------
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

    const { rows } = await pool.query(`SELECT ${COLUMNS} FROM hotels WHERE id = $1`, [id]);
    if (!rows.length) return res.status(404).json({ message: 'Hotel not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// ---------- POST /api/hotels ----------
router.post('/', upload.single('image'), validateHotel(true), async (req, res, next) => {
  try {
    const { title, description, latitude, longitude, price } = req.hotel;
    const { rows } = await pool.query(
      `INSERT INTO hotels (title, description, image_path, latitude, longitude, price)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${COLUMNS}`,
      [title, description, toImageUrl(req.file.filename), latitude, longitude, price]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (req.file) removeImage(req.file.filename);
    next(err);
  }
});

// ---------- PUT /api/hotels/:id ----------
router.put('/:id', upload.single('image'), validateHotel(false), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      if (req.file) removeImage(req.file.filename);
      return res.status(400).json({ message: 'Invalid id' });
    }

    const existing = await pool.query('SELECT image_path FROM hotels WHERE id = $1', [id]);
    if (!existing.rows.length) {
      if (req.file) removeImage(req.file.filename);
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const oldImage = existing.rows[0].image_path;
    const newImage = req.file ? toImageUrl(req.file.filename) : oldImage;
    const { title, description, latitude, longitude, price } = req.hotel;

    const { rows } = await pool.query(
      `UPDATE hotels
         SET title = $1, description = $2, image_path = $3,
             latitude = $4, longitude = $5, price = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING ${COLUMNS}`,
      [title, description, newImage, latitude, longitude, price, id]
    );

    if (req.file && oldImage) removeImage(oldImage); // replaced image -> delete the old file
    res.json(rows[0]);
  } catch (err) {
    if (req.file) removeImage(req.file.filename);
    next(err);
  }
});

// ---------- DELETE /api/hotels/:id ----------
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

    const { rows } = await pool.query('DELETE FROM hotels WHERE id = $1 RETURNING image_path', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Hotel not found' });

    removeImage(rows[0].image_path); // also delete the image file from the server
    res.json({ message: 'Hotel deleted successfully', id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
