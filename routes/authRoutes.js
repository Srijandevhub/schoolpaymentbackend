const express = require('express');
const { login, protected, register, logout } = require('../controllers/authControllers');
const { checkAuth } = require('../middlewares/authMiddlewares');
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/protected", checkAuth, protected);
router.post("/logout", checkAuth, logout);
module.exports = router;
