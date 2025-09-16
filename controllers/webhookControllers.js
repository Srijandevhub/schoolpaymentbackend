const Webhooklog = require('../models/webhookLogModel');
const Orderstatus = require("../models/orderStatusModel");

const handleWebHook = async (req, res) => {
    const payload = req.body;
    const log = await Webhooklog.create({ payload });
    try {
        const info = payload.order_info;
        if (!info?.order_id) {
            return res.status(400).json({ message: "Invalid webhook payload" });
        }

        await Orderstatus.findOneAndUpdate({ collect_request_id: info.order_id }, {
            $set: {
                order_amount: info.order_amount,
                transaction_amount: info.transaction_amount,
                payment_mode: info.payment_mode,
                payment_details: info.payemnt_details || info.payment_details,
                bank_reference: info.bank_reference,
                payment_message: info.Payment_message,
                status: info.status,
                error_message: info.error_message,
                payment_time: new Date(info.payment_time)
            }
        }, { upsert: false });

        log.processed = true;
        await log.save();
        return res.status(200).json({ ok: true });

    } catch (error) {
        log.error = error.message;
        await log.save();
        console.error('webhook error:', error.message);
        return res.status(500).json({ message: 'Webhook processing failed' });
    }
}

module.exports = { handleWebHook };