const { verifyToken } = require("../helpers/authHelpers");

const checkAuth = (req, res, next) => {
    try {
        const accessToken = req.cookies.accesstoken;
        if (!accessToken) {
            return res.status(403).json({ message: "Access forbidden: Token not found" });
        }
        const data = verifyToken(accessToken, process.env.JWT_SECRET);
        if (!data) {
            return res.status(403).json({ message: "Access forbidden: Token verification failed" });
        }
        req.user = data;
        next();
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

module.exports = { checkAuth };