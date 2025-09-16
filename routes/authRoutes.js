const express = require('express');
const { login, protected, register } = require('../controllers/authControllers');
const { checkAuth } = require('../middlewares/authMiddlewares');
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/protected", checkAuth, protected);
module.exports = router;