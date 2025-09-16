const { generateToken } = require('../helpers/authHelpers');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userAlreadyPresent = await User.findOne({ email });
        if (userAlreadyPresent) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword});
        await newUser.save();
        res.status(200).json({ message: "User created", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const userExits = await User.findOne({ email });
        if (!userExits) {
            return res.status(400).json({ message: "User not found" });
        }
        const passwordMatch = await bcrypt.compare(password, userExits.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: "You have entered wrong password" });
        }
        const tokenPayload = {
            _id: userExits._id,
            name: userExits.name,
            email: userExits.email
        }
        const accessToken = generateToken(tokenPayload, process.env.JWT_SECRET, '1d');
        res.cookie("accesstoken", accessToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: "strict" });
        res.status(200).json({ ok: true, message: "User loggedin" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
const protected = async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({ message: "Access Allowed", user: user });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
module.exports = { register, login, protected };