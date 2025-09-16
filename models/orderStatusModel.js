const mongoose = require('mongoose');
const orderStatusSchema = new mongoose.Schema({
    collect_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', index: true },
    order_amount: { type: Number, required: true },
    transaction_amount: { type: Number },
    payment_mode: { type: String },
    payment_details: { type: String },
    bank_reference: { type: String },
    payment_message: { type: String },
    status: { type: String, index: true },
    error_message: { type: String },
    payment_time: { type: Date },
    collect_request_id: { type: String, index: true },
    payment_url: { type: String },
    gateway_response: { type: Object },
    last_checked_at: { type: Date },
    custom_order_id: { type: String, unique: true, sparse: true, index: true }
}, { timestamps: true });
const Orderstatus = mongoose.model('orderstatus', orderStatusSchema);
module.exports = Orderstatus;