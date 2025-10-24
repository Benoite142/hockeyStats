// DEMO VERSION - No database connection
// This is a gpt generated placeholder for database functionality
// I have removed the actual database connection since I don't have access to the database.
console.log('📝 Demo Mode: Database connection disabled');

// Mock pool object for compatibility
const pool = {
    query: async (text, params) => {
        console.log('🚫 Demo Mode: Database query blocked');
        console.log('Query:', text);
        console.log('Params:', params);
        
        // Return empty result for demo
        return {
            rows: [],
            rowCount: 0
        };
    },
    
    connect: async () => {
        console.log('🚫 Demo Mode: Database connection blocked');
        return {
            query: pool.query,
            release: () => {
                console.log('🚫 Demo Mode: Connection release blocked');
            }
        };
    },
    
    on: (event, callback) => {
        console.log(`🚫 Demo Mode: Database event listener for '${event}' blocked`);
    },
    
    end: () => {
        console.log('🚫 Demo Mode: Database pool end blocked');
    }
};

export default pool;
