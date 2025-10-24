import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());    

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const searchRoute = await import('./search/searchPlayers.js');
const statsRoute = await import('./stats/playerStats.js');

app.use('/search', searchRoute.default);
app.use('/stats', statsRoute.default);

app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
