import express from 'express';

const router = express.Router();

// Get team roster by team abbreviation - DEMO VERSION (no database)
router.get('/:teamAbrv', async (req, res) => {
    try {
        const { teamAbrv } = req.params;
        
        // Demo: Return empty roster structure for any team
        const roster = {
            forwards: [],
            defensemen: [],
            goalies: [],
            teamName: getTeamName(teamAbrv.toUpperCase()),
            teamAbbr: teamAbrv.toUpperCase(),
            message: "Demo version - No player data available"
        };
        
        // Add small delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 500));
        
        res.json(roster);
        
    } catch (error) {
        console.error('Error in demo team roster:', error);
        res.status(500).json({ error: 'Failed to fetch team roster (demo mode)' });
    }
});

// Helper function to get team name from abbreviation
function getTeamName(abbr) {
    const teams = {
        'ANA': 'Anaheim Ducks',
        'BOS': 'Boston Bruins',
        'BUF': 'Buffalo Sabres',
        'CAR': 'Carolina Hurricanes',
        'CBJ': 'Columbus Blue Jackets',
        'CGY': 'Calgary Flames',
        'CHI': 'Chicago Blackhawks',
        'COL': 'Colorado Avalanche',
        'DAL': 'Dallas Stars',
        'DET': 'Detroit Red Wings',
        'EDM': 'Edmonton Oilers',
        'FLA': 'Florida Panthers',
        'LAK': 'Los Angeles Kings',
        'MIN': 'Minnesota Wild',
        'MTL': 'Montreal Canadiens',
        'NSH': 'Nashville Predators',
        'NJD': 'New Jersey Devils',
        'NYI': 'New York Islanders',
        'NYR': 'New York Rangers',
        'OTT': 'Ottawa Senators',
        'PHI': 'Philadelphia Flyers',
        'PIT': 'Pittsburgh Penguins',
        'SEA': 'Seattle Kraken',
        'SJS': 'San Jose Sharks',
        'STL': 'St. Louis Blues',
        'TBL': 'Tampa Bay Lightning',
        'TOR': 'Toronto Maple Leafs',
        'UTA': 'Utah Hockey Club',
        'VAN': 'Vancouver Canucks',
        'VGK': 'Vegas Golden Knights',
        'WSH': 'Washington Capitals',
        'WPG': 'Winnipeg Jets'
    };
    
    return teams[abbr] || `${abbr} Team`;
}

export default router;
