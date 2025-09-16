const jwt = require('jsonwebtoken');
const createPgSign = (payload) => {
    const PG_SECRET = process.env.PG_SECRET_KEY;
    if (!PG_SECRET) throw new Error('PG_SECRET_KEY not set in env');
    return jwt.sign(payload, PG_SECRET, { algorithm: 'HS256' });
}

module.exports = { createPgSign };