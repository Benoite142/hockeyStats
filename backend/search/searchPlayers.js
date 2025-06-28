import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();
const SEARCH_PLAYER_API_URL = 'https://search.d3.nhle.com/api/v1/search/player?culture=en-us&limit=20&q=';

router.get('/', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Missing query' });

    try {
        const response = await fetch(SEARCH_PLAYER_API_URL + encodeURIComponent(query));
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch player data' });
    }
});

export default router;
