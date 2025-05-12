import { error } from 'console';
import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/', async (req, res)=> {
    const id= req.query.id;
    if (!id) return res.status(400).json({error: 'Missing query'});

    try{
        const response = await fetch(`https://api-web.nhle.com/v1/player/${id}/landing`);
        const data = await response.json();
        res.json(data);
    } catch(err) {
        console.error(err);
        res.status(500).json({error: "Failed to fetch player data"});
    }
});

export default router;