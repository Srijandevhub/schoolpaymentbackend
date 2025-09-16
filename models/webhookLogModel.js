const mongoose = require('mongoose');
const webhookLogSchema = new mongoose.Schema({
    payload: { type: Object, required: true },
    received_at: { type: Date, default: Date.now },
    processed: { type: Boolean, default: false },
    error: { type: String }
});
const Webhooklog = mongoose.model("webhooklog", webhookLogSchema);
module.exports = Webhooklog;