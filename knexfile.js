require('dotenv').config();
const config = {
    client: 'pg',
    connection: {
      host:     process.env.POSTGRES_HOST || 'localhost',
      database: process.env.POSTGRES_DB || 'stitch-playlists',
      user:     process.env.POSTGRES_USER || 'stitch',
      password: process.env.POSTGRES_PASSWORD || 'stitch'
    },
    pool: { min: 0, max: 10 },
    migrations: { directory: './db/migrations' }
};
module.exports = config;
