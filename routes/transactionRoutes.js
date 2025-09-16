const express = require('express');
const { checkAuth } = require('../middlewares/authMiddlewares');
const { getTransactions, getTransactionsBySchool, getTransactionStatus } = require('../controllers/transactionControllers');
const router = express.Router();
router.get("/transactions", checkAuth, getTransactions);
router.get("/transactions/school/:schoolId", checkAuth, getTransactionsBySchool);
router.get("/transaction-status/:custom_order_id", checkAuth, getTransactionStatus);
module.exports = router;