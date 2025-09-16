const axios = require('axios');
const Order = require('../models/orderModel');
const OrderStatus = require('../models/orderStatusModel');
const { createPgSign } = require('../helpers/paymentSign');

const PAYMENT_API_BASE = process.env.PAYMENT_API_BASE || 'https://dev-vanilla.edviron.com/erp';
const PAYMENT_API_KEY = process.env.PAYMENT_API_KEY;

const createCollectRequest = async (req, res) => {
    try {
        const { school_id, amount, student_info, custom_order_id, callback_url = "http://dummy.com" } = req.body;
        if (!school_id || !amount) {
            return res.status(400).json({ message: 'school_id, amount, callback_url are required' });
        }

        const order = await Order.create({
            school_id,
            student_info: student_info || { name: "NA", id: "NA" },
            custom_order_id
        });

        const signPayload = { school_id, amount: String(amount), callback_url };
        const sign = createPgSign(signPayload);

        const url = `${PAYMENT_API_BASE}/create-collect-request`;
        const body = { school_id, amount: String(amount), callback_url, sign };

        const gatewayResp = await axios.post(url, body, {
            headers: {
                'Content-Type': "application/json",
                Authorization: `Bearer ${PAYMENT_API_KEY}`
            }
        });

        const { collect_request_id, collect_request_url } = gatewayResp.data;

        await OrderStatus.create({
            collect_id: order._id,
            collect_request_id,
            order_amount: String(amount),
            status: 'created',
            payment_url: collect_request_url,
            gateway_response: gatewayResp.data,
            custom_order_id
        });

        return res.json({
            collect_request_id,
            payment_url: collect_request_url,
            order_id: order._id,
            callback_url: `http://localhost:${process.env.PORT}/status/${collect_request_id}?school_id=${school_id}`
        });

    } catch (error) {
        console.error('createCollectRequest error:', error?.response?.data || error.message || error);
        const gatewayErr = error?.response?.data || null;
        return res.status(500).json({ message: 'Failed to create collect request', error: gatewayErr || error.message });
    }
}
const checkCollectStatus = async (req, res) => {
    try {
        const { collect_request_id } = req.params;
        const { school_id } = req.query;
        if (!collect_request_id || !school_id) {
            return res.status(400).json({ message: 'collect_request_id, school_id are required' });
        }

        const sign = createPgSign({ school_id, collect_request_id });
        
        const url = `${PAYMENT_API_BASE}/collect-request/${collect_request_id}`;
        const gatewayResp = await axios.get(url, {
            params: { school_id, sign },
            headers: {
                Authorization: `Bearer ${PAYMENT_API_KEY}`
            }
        });

        const data = gatewayResp.data;

        const updated = await OrderStatus.findOneAndUpdate({ collect_request_id }, {
            $set: {
                status: data.status?.toLowerCase(),
                transaction_amount: Number(data.amount),
                gateway_response: data,
                last_checked_at: new Date()
            }
        }, { new: true });

        res.status(200).json({ ok: true, status: data.status, updated });

    } catch (error) {
        console.error('checkCollectStatus error', err.response?.data || err.message);
        res.status(500).json({ message: 'Failed to check status', error: err.message });
    }
}

module.exports = { createCollectRequest, checkCollectStatus };