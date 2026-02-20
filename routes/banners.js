const express = require('express');
const routes = express.Router();
const pool = require('../dbcon');

const createConnection = async () => await pool.getConnection();
const closeConnection = async (conn) => { if (conn) conn.release(); };

// GET /admin/banners
routes.get('/', async (req, res) => {
    const connection = await createConnection();
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM event_banners ORDER BY created_at DESC'
        );
        // Fix: Wrap rows in a 'data' object to match Accommodations.tsx pattern
        res.json({ data: rows }); 
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch banners' });
    } finally {
        await closeConnection(connection);
    }
});

// POST /admin/banners
routes.post('/', async (req, res) => {
    const { title, imageUrl, linkUrl, startDate, endDate } = req.body;
    const connection = await createConnection();
    try {
        const [result] = await connection.execute(
            `INSERT INTO event_banners (title, imageUrl, linkUrl, startDate, endDate) 
             VALUES (?, ?, ?, ?, ?)`,
            [title, imageUrl, linkUrl || null, startDate, endDate]
        );
        res.status(201).json({ message: 'Banner created', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    } finally {
        await closeConnection(connection);
    }
});

// DELETE /admin/banners/:id
routes.delete('/:id', async (req, res) => {
    const connection = await createConnection();
    try {
        await connection.execute('DELETE FROM event_banners WHERE id = ?', [req.params.id]);
        res.json({ message: 'Banner deleted' });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = routes;