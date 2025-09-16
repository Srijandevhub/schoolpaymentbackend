const mongoose = require('mongoose');
const StudentInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  id: { type: String, required: true },
  email: { type: String }
}, { _id: false });
const orderSchema = new mongoose.Schema({
    school_id: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    trustee_id: { type: mongoose.Schema.Types.ObjectId },
    student_info: { type: StudentInfoSchema, required: true },
    gateway_name: { type: String, default: "cashfree" },
    custom_order_id: { type: String, unique: true, sparse: true, index: true }
}, { timestamps: true });
const Order = mongoose.model("order", orderSchema);
module.exports = Order;