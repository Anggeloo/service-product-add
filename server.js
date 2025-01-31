const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db/db');
const ApiResponse = require('./models/ApiResponse');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/products', async (req, res) => {
  const { name, description, category, material, color, price } = req.body;

  if (!name || !price) {
    return res.status(400).json(ApiResponse('error', null, 'You must provide code, name, and price.'));
  }

  try {

    const countQuery = 'SELECT COUNT(*) FROM products';
    const countResult = await pool.query(countQuery);

    const totalProducts = Number(countResult.rows[0].count) + 1;

    const query = `
      INSERT INTO products (
        product_code, name, description, category, material, color, price
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const params = [
      `PRO_${totalProducts}`, name, description, category, material, color, price
    ];

    const result = await pool.query(query, params);

    res.status(201).json(ApiResponse('success', result.rows[0], 'Product successfully saved'));
  } catch (err) {
    console.log(err);
    res.status(500).json(ApiResponse('error', null, 'Error saving the product'));
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
