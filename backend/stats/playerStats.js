import express from 'express';
import fetch from 'node-fetch';
import { convertInchesInFoot, convertPosition, convertShoot } from '../utils/convertData.js'

const router = express.Router();

router.get('/', async (req, res) => {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'Missing query' });

    try {
        const response = await fetch(`https://api-web.nhle.com/v1/player/${id}/landing`);
        const data = await response.json();
        let processedData = processdata(data)
        res.json(processedData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch player data" });
    }
});

export default router;

function processdata(data) {
    if (!data) return {};

    const { firstName, lastName, headshot, heroImage, birthDate, heightInInches, weightInPounds, shootsCatches,
        position, currentTeamAbbrev, sweaterNumber, birthCity, birthCountry, seasonTotals } = data;

    return {
        firstName: firstName?.default || "",
        lastName: lastName?.default || "",
        birthDate: birthDate || "",
        headshot: headshot,
        heroImage: heroImage,
        heightInInches: convertInchesInFoot(heightInInches) || "",
        weightInPounds: weightInPounds || "",
        shootsCatches: convertShoot(shootsCatches) || "",
        position: convertPosition(position) || "",
        team: currentTeamAbbrev || "",
        number: sweaterNumber || "",
        birthCity: birthCity?.default || "",
        birthCountry: birthCountry || "",
        seasonTotals: seasonTotals || "",
    };
}

