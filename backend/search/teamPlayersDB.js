import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Get team roster by team abbreviation
router.get('/:teamAbrv', async (req, res) => {
    try {
        const { teamAbrv } = req.params;
        const useDatabase = req.query.db === 'true'; // Optional database usage
        
        if (useDatabase) {
            // Demo: Return empty roster for database requests
            console.log('🚫 Demo Mode: Database request blocked for team', teamAbrv);
            const transformedRoster = {
                forwards: [],
                defensemen: [],
                goalies: [],
                message: "Demo mode - Database access disabled"
            };
            
            res.json(transformedRoster);
        } else {
            // Use NHL API (existing functionality)
            const TEAM_ROSTER_API_URL = `https://api-web.nhle.com/v1/roster/${teamAbrv}/current`;
            const response = await fetch(TEAM_ROSTER_API_URL);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch team roster: ${response.status}`);
            }
            
            const data = await response.json();
            res.json(data);
        }
    } catch (error) {
        console.error('Error fetching team roster:', error);
        res.status(500).json({ error: 'Failed to fetch team roster' });
    }
});

export default router;
