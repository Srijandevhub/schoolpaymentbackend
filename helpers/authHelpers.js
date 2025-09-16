const jwt = require('jsonwebtoken');
const generateToken = (data, secret, age) => {
    const token = jwt.sign(data, secret, { expiresIn: age });
    return token;
}
const verifyToken = (token, secret) => {
    try {
        const decoded = jwt.verify(token, secret);
        return decoded;
    } catch (error) {
        return null;
    }
}
module.exports = { generateToken, verifyToken };