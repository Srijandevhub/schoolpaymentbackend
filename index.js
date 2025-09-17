const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const databaseConfig = require('./config/databaseConfig');
const app = express();
app.use(express.json());
app.use(cors({ origin: "https://schoolpaymentclient.vercel.app", methods: ["POST", "GET", "PUT", "DELETE"], credentials: true }));
app.use(cookieParser({ origin: "https://schoolpaymentclient.vercel.app" }));
app.use("/auth", require('./routes/authRoutes'));
app.use("/", require("./routes/paymentRoutes"));
app.use("/", require('./routes/transactionRoutes'));
const port = process.env.PORT || 8000;
const mongoUrl = process.env.MONGO_URL;
databaseConfig(mongoUrl);
app.listen(port, () => {
    console.log(`Server started at ${port}`);
})