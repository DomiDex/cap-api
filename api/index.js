const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Database connection
const { DATABASE_URL } = process.env;
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // This may be required for cloud DBs
  },
});

app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' https://vercel.live; style-src 'self'; connect-src 'self' https://vercel.live; img-src 'self';"
  );
  next();
});

// GET templates
app.get('/templates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM templates');
    res.json(result.rows); // Fixed the result formatting
  } catch (err) {
    console.error('Error fetching templates:', err);
    res.status(500).send('Error fetching templates');
  }
});

// POST templates
app.post('/templates', async (req, res) => {
  const {
    name,
    category,
    price,
    template_link,
    short_description,
    long_description,
    image_main,
    image_thumbnail,
  } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO templates (name, category, price, template_link, short_description, long_description, image_main, image_thumbnail) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [
        name,
        category,
        price,
        template_link,
        short_description,
        long_description,
        image_main,
        image_thumbnail,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating template:', err);
    res.status(500).send('Error creating template');
  }
});

// PUT templates
app.put('/templates/:id', async (req, res) => {
  const templateId = req.params.id;
  const {
    name,
    category,
    price,
    template_link,
    short_description,
    long_description,
    image_main,
    image_thumbnail,
  } = req.body;
  try {
    const result = await pool.query(
      'UPDATE templates SET name = $1, category = $2, price = $3, template_link = $4, short_description = $5, long_description = $6, image_main = $7, image_thumbnail = $8 WHERE id = $9 RETURNING *',
      [
        name,
        category,
        price,
        template_link,
        short_description,
        long_description,
        image_main,
        image_thumbnail,
        templateId,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Template not found');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating template:', err);
    res.status(500).send('Error updating template');
  }
});

// DELETE templates
app.delete('/templates/:id', async (req, res) => {
  const templateId = req.params.id;
  try {
    const result = await pool.query(
      'DELETE FROM templates WHERE id = $1 RETURNING *',
      [templateId]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Template not found');
    }
    res.json({ message: 'Template deleted successfully' });
  } catch (err) {
    console.error('Error deleting template:', err);
    res.status(500).send('Error deleting template');
  }
});

// Export the app as a Vercel handler
module.exports = app;
