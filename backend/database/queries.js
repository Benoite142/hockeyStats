import pool from './db.js';
/* This file was for meant to be for a
database connection where I had access
to the coordinates to make a map of the players' birthplaces.
Since I don't have access to the database, this file is unused, but I'm keeping it for future reference.
*/

// Team queries
export const teamQueries = {
    // Get all teams
    getAllTeams: async () => {
        const result = await pool.query(`
            SELECT id, abbreviation, name, city, conference, division
            FROM teams 
            ORDER BY name
        `);
        return result.rows;
    },
    
    // Get team by abbreviation
    getTeamByAbbr: async (abbr) => {
        const result = await pool.query(`
            SELECT id, abbreviation, name, city, conference, division
            FROM teams 
            WHERE abbreviation = $1
        `, [abbr]);
        return result.rows[0];
    },
    
    // Get team roster
    getTeamRoster: async (teamAbbr) => {
        const result = await pool.query(`
            SELECT 
                p.id,
                p.nhl_id,
                p.first_name,
                p.last_name,
                p.jersey_number,
                p.position,
                p.shoots_catches,
                p.height_inches,
                p.weight_pounds,
                p.birth_date,
                l.city as birth_city,
                l.state_province as birth_state,
                l.country as birth_country,
                l.latitude as birth_lat,
                l.longitude as birth_lng,
                tp.jersey_number as current_jersey
            FROM players p
            JOIN team_players tp ON p.id = tp.player_id
            JOIN teams t ON tp.team_id = t.id
            LEFT JOIN locations l ON p.birth_location_id = l.id
            WHERE t.abbreviation = $1 AND tp.is_current = true
            ORDER BY p.position, p.jersey_number
        `, [teamAbbr]);
        return result.rows;
    }
};

// Player queries
export const playerQueries = {
    // Search players by name
    searchPlayers: async (searchTerm) => {
        const result = await pool.query(`
            SELECT 
                p.id,
                p.nhl_id,
                p.first_name,
                p.last_name,
                p.jersey_number,
                p.position,
                t.abbreviation as team_abbr,
                t.name as team_name
            FROM players p
            LEFT JOIN teams t ON p.current_team_id = t.id
            WHERE 
                LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER($1)
                OR LOWER(p.first_name) LIKE LOWER($1)
                OR LOWER(p.last_name) LIKE LOWER($1)
            ORDER BY p.last_name, p.first_name
            LIMIT 20
        `, [`%${searchTerm}%`]);
        return result.rows;
    },
    
    // Get player details
    getPlayerDetails: async (playerId) => {
        const result = await pool.query(`
            SELECT 
                p.*,
                t.abbreviation as team_abbr,
                t.name as team_name,
                l.city as birth_city,
                l.state_province as birth_state,
                l.country as birth_country,
                l.latitude as birth_lat,
                l.longitude as birth_lng
            FROM players p
            LEFT JOIN teams t ON p.current_team_id = t.id
            LEFT JOIN locations l ON p.birth_location_id = l.id
            WHERE p.id = $1 OR p.nhl_id = $1
        `, [playerId]);
        return result.rows[0];
    },
    
    // Get player by name
    getPlayerByName: async (firstName, lastName) => {
        const result = await pool.query(`
            SELECT 
                p.*,
                t.abbreviation as team_abbr,
                t.name as team_name,
                l.city as birth_city,
                l.state_province as birth_state,
                l.country as birth_country,
                l.latitude as birth_lat,
                l.longitude as birth_lng
            FROM players p
            LEFT JOIN teams t ON p.current_team_id = t.id
            LEFT JOIN locations l ON p.birth_location_id = l.id
            WHERE LOWER(p.first_name) = LOWER($1) AND LOWER(p.last_name) = LOWER($2)
        `, [firstName, lastName]);
        return result.rows[0];
    }
};

// Location queries
export const locationQueries = {
    // Get all birth locations with player counts
    getAllBirthLocations: async () => {
        const result = await pool.query(`
            SELECT 
                l.*,
                COUNT(p.id) as player_count
            FROM locations l
            LEFT JOIN players p ON l.id = p.birth_location_id
            GROUP BY l.id
            HAVING COUNT(p.id) > 0
            ORDER BY player_count DESC
        `);
        return result.rows;
    },
    
    // Get players from a specific location
    getPlayersByLocation: async (locationId) => {
        const result = await pool.query(`
            SELECT 
                p.first_name,
                p.last_name,
                p.position,
                t.abbreviation as team_abbr,
                t.name as team_name
            FROM players p
            LEFT JOIN teams t ON p.current_team_id = t.id
            WHERE p.birth_location_id = $1
            ORDER BY p.last_name, p.first_name
        `, [locationId]);
        return result.rows;
    }
};

// Statistics queries
export const statsQueries = {
    // Get team statistics
    getTeamStats: async () => {
        const result = await pool.query(`
            SELECT 
                t.abbreviation,
                t.name,
                COUNT(p.id) as total_players,
                COUNT(CASE WHEN p.position IN ('L', 'R', 'C') THEN 1 END) as forwards,
                COUNT(CASE WHEN p.position = 'D' THEN 1 END) as defensemen,
                COUNT(CASE WHEN p.position = 'G' THEN 1 END) as goalies
            FROM teams t
            LEFT JOIN players p ON t.id = p.current_team_id
            GROUP BY t.id, t.abbreviation, t.name
            ORDER BY t.name
        `);
        return result.rows;
    },
    
    // Get birth country statistics
    getBirthCountryStats: async () => {
        const result = await pool.query(`
            SELECT 
                l.country,
                COUNT(p.id) as player_count
            FROM locations l
            JOIN players p ON l.id = p.birth_location_id
            GROUP BY l.country
            ORDER BY player_count DESC
        `);
        return result.rows;
    }
};
