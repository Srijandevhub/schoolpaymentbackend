const express = require('express');
const { createCollectRequest, checkCollectStatus } = require('../controllers/paymentController');
const { handleWebHook } = require('../controllers/webhookControllers');
const router = express.Router();
router.post('/create-payment', createCollectRequest);
router.get('/status/:collect_request_id', checkCollectStatus);
router.post("/webhook", handleWebHook);
module.exports = router;