const express = require('express');
const routes = express.Router();
const pool = require('../dbcon');

const createConnection = async () => await pool.getConnection();
const closeConnection = async (conn) => { if (conn) conn.release(); };

// POST /admin/banners - Match the logic in properties.js routes.post('/accommodations')
routes.post('/', async (req, res) => {
    const { title, imageUrl, linkUrl, startDate, endDate } = req.body;
    const connection = await createConnection();

    try {
        const [result] = await connection.execute(
            `INSERT INTO event_banners (title, imageUrl, linkUrl, startDate, endDate) 
             VALUES (?, ?, ?, ?, ?)`,
            [title, imageUrl, linkUrl || null, startDate, endDate]
        );

        res.status(201).json({
            message: 'Banner created successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error creating banner:', error);
        res.status(500).json({ error: 'Failed to create banner' });
    } finally {
        await closeConnection(connection);
    }
});

// GET /admin/banners - Fetch for display
routes.get('/', async (req, res) => {
    const connection = await createConnection();
    try {
        const [rows] = await connection.execute('SELECT * FROM event_banners ORDER BY created_at DESC');
        res.json({ data: rows });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = routes;