let express = require('express');
let path = require('path');
let app = express();
const { Pool } = require('pg');
require('dotenv').config();
const cors = require('cors');

const { DATABASE_URL } = process.env;
app.use(express.json());
app.use(cors());
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    require: true,
  },
});

async function getPostgresVersion() {
  const client = await pool.connect();
  try {
    const response = await client.query('SELECT version()');
    console.log(response.rows[0]);
  } finally {
    client.release();
  }
}

// GET
app.get('/templates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM templates');
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching templates');
  }
});

// POST
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
      'INSERT INTO templates (name, category, price, template_link, short_description, long_description,image_main,image_thumbnail ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
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
    console.error(err);
    res.status(500).send('Error creating template');
  }
});

// PUT
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
      'UPDATE templates SET name = $1, category = $2, price = $3, template_link = $4, short_description = $5, long_description = $6,image_main=$7,image_thumbnail=$8 WHERE id = $9 RETURNING *',
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
    console.error(err);
    res.status(500).send('Error updating template');
  }
});

// DELETE
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
    console.error(err);
    res.status(500).send('Error deleting template');
  }
});

// 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
