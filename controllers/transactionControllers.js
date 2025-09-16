const Order = require("../models/orderModel");
const Orderstatus = require('../models/orderStatusModel');


const getTransactions = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const limit = Math.min(100, parseInt(req.query.limit || "10"));
    const skip = (page - 1) * limit;

    const sortField = req.query.sortField || "order_status.payment_time";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const statusFilter = req.query.status ? req.query.status.split(",") : null;
    const schoolFilter = req.query.school ? req.query.school.split(",") : null;
    const search = req.query.search || null;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    const matchStage = {};

    if (statusFilter) matchStage["order_status.status"] = { $in: statusFilter };
    if (schoolFilter) matchStage["school_id"] = { $in: schoolFilter };
    if (search) matchStage["order_status.custom_order_id"] = { $regex: search, $options: "i" };
    if (startDate && endDate) {
      matchStage["order_status.payment_time"] = { $gte: startDate, $lte: endDate };
    }

    const pipeline = [
      {
        $lookup: {
          from: "orderstatuses",
          localField: "_id",
          foreignField: "collect_id",
          as: "order_status",
        },
      },
      { $unwind: { path: "$order_status", preserveNullAndEmptyArrays: true } },
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $project: {
          collect_id: "$order_status.collect_id",
          school_id: "$school_id",
          gateway: "$gateway_name",
          order_amount: "$order_status.order_amount",
          transaction_amount: "$order_status.transaction_amount",
          status: "$order_status.status",
          custom_order_id: "$order_status.custom_order_id",
          payment_time: "$order_status.payment_time", // 👈 keep for sorting & filtering
        },
      },
      { $sort: { [sortField]: sortOrder } },
      {
        $facet: {
          results: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const data = await Order.aggregate(pipeline);
    const results = data[0].results || [];
    const total = data[0].totalCount[0] ? data[0].totalCount[0].count : 0;

    res.json({ page, limit, total, results });
  } catch (error) {
    console.error("Error in getTransactions:", error);
    res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
  }
};

// const getTransactions = async (req, res) => {
//     try {
//         const page = Math.max(1, parseInt(req.query.page || '1'));
//         const limit = Math.min(100, parseInt(req.query.limit || '10'));
//         const skip = (page - 1) * limit;
//         const sortField = req.query.sort || 'order_status.payment_time';
//         const sortOrder = req.query.order === 'asc' ? 1 : -1;
//         const statusFilter = req.query.status ? req.query.status.split(',') : null;

//         const pipeline = [
//         {
//             $lookup: {
//             from: 'orderstatuses',
//             localField: '_id',
//             foreignField: 'collect_id',
//             as: 'order_status'
//             }
//         },
//         { $unwind: { path: '$order_status', preserveNullAndEmptyArrays: true } },

//         ...(statusFilter
//             ? [{ $match: { 'order_status.status': { $in: statusFilter } } }]
//             : []),

//         {
//             $project: {
//             collect_id: '$order_status.collect_id',
//             school_id: '$school_id',
//             gateway: '$gateway_name',
//             order_amount: '$order_status.order_amount',
//             transaction_amount: '$order_status.transaction_amount',
//             status: '$order_status.status',
//             custom_order_id: '$order_status.custom_order_id'   // 👈 pull from OrderStatus
//             }
//         },
//         { $sort: { [sortField]: sortOrder } },
//         { $skip: skip },
//         { $limit: limit }
//         ];

//         const data = await Order.aggregate(pipeline);
//         res.json({ page, limit, total: data.length, results: data });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
//     }
// }
const getTransactionsBySchool = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const page = Math.max(1, parseInt(req.query.page || '1'));
        const limit = Math.min(100, parseInt(req.query.limit || '10'));
        const skip = (page - 1) * limit;

        const sortField = req.query.sort || 'order_status.payment_time';
        const sortOrder = req.query.order === 'asc' ? 1 : -1;

        const statusFilter = req.query.status ? req.query.status.split(',') : null;

        // const pipeline = [
        // {
        //     $addFields: { school_id_str: { $toString: "$school_id" } }
        // },
        // {
        //     $match: { school_id_str: schoolId.toString() }
        // },
        // {
        //     $lookup: {
        //     from: 'orderstatuses',
        //     localField: '_id',
        //     foreignField: 'collect_id',
        //     as: 'order_status'
        //     }
        // },
        // { $unwind: { path: '$order_status', preserveNullAndEmptyArrays: true } },
        // ...(statusFilter
        //     ? [{ $match: { 'order_status.status': { $in: statusFilter } } }]
        //     : []),
        // {
        //     $project: {
        //     _id: 1,
        //     collect_id: '$order_status.collect_id',
        //     school_id: '$school_id',
        //     gateway: '$gateway_name',
        //     order_amount: '$order_status.order_amount',
        //     transaction_amount: '$order_status.transaction_amount',
        //     status: '$order_status.status',
        //     custom_order_id: '$order_status.custom_order_id',
        //     payment_time: '$order_status.payment_time',
        //     student_info: '$student_info'
        //     }
        // },
        // { $sort: { [sortField]: sortOrder } },
        // { $skip: skip },
        // { $limit: limit }
        // ];

        const pipeline = [
        {
          $addFields: { school_id_str: { $toString: "$school_id" } }
        },
        {
          $match: { school_id_str: schoolId.toString() }
        },
        {
          $lookup: {
            from: 'orderstatuses',
            localField: '_id',
            foreignField: 'collect_id',
            as: 'order_statuses'
          }
        },
        // Unwind statuses to get one doc per status
        { $unwind: { path: "$order_statuses", preserveNullAndEmptyArrays: true } },
        // Sort statuses per collect_id by payment_time desc
        { $sort: { "order_statuses.payment_time": -1 } },
        // Group back to one document per collect_id (latest status only)
        {
          $group: {
            _id: "$_id",
            school_id: { $first: "$school_id" },
            gateway: { $first: "$gateway_name" },
            student_info: { $first: "$student_info" },
            order_status: { $first: "$order_statuses" }
          }
        },
        ...(statusFilter
          ? [{ $match: { 'order_status.status': { $in: statusFilter } } }]
          : []),
        {
          $project: {
            _id: 1,
            collect_id: '$order_status.collect_id',
            school_id: 1,
            gateway: 1,
            order_amount: '$order_status.order_amount',
            transaction_amount: '$order_status.transaction_amount',
            status: '$order_status.status',
            custom_order_id: '$order_status.custom_order_id',
            payment_time: '$order_status.payment_time',
            student_info: 1
          }
        },
        { $sort: { [sortField]: sortOrder } },
        { $skip: skip },
        { $limit: limit }
      ];



        const results = await Order.aggregate(pipeline);
        // const total = results[0].metadata[0]?.total || 0;

        //const aggResult = await Order.aggregate(pipeline);

//const total = aggResult[0].metadata[0]?.total || 0;
//const results = aggResult[0].data;
        const countPipeline = [
          {
            $addFields: { school_id_str: { $toString: "$school_id" } }
          },
          {
            $match: { school_id_str: schoolId.toString() }
          },
          {
            $lookup: {
              from: 'orderstatuses',
              localField: '_id',
              foreignField: 'collect_id',
              as: 'order_statuses'
            }
          },
          { $unwind: { path: "$order_statuses", preserveNullAndEmptyArrays: true } },
          { $sort: { "order_statuses.payment_time": -1 } },
          {
            $group: { _id: "$_id" }
          },
          { $count: "total" }
        ];

        const countResult = await Order.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;




        return res.json({
        ok: true,
        school_id: schoolId,
        page,
        limit,
        total,
        results
        });

    } catch (error) {
        console.error('getTransactionsBySchool error:', error);
        res.status(500).json({ message: 'Failed to fetch school transactions', error: error.message });
    }
}
const getTransactionStatus = async (req, res) => {
    try {
        const { custom_order_id } = req.params;

        if (!custom_order_id) {
          return res.status(400).json({ ok: false, message: "custom_order_id is required" });
        }

        const order = await Order.findOne({ custom_order_id });
        if (!order) {
          return res.status(404).json({ ok: false, message: "Order not found" });
        }

        const orderStatus = await Orderstatus.findOne({ collect_id: order._id })
        .sort({ updatedAt: -1 });

        return res.status(200).json({
            ok: true,
            custom_order_id,
            status: orderStatus ? orderStatus.status : "INITIATED",
            transaction_amount: orderStatus ? orderStatus.transaction_amount : 0,
            order_amount: order.order_amount,
            gateway: order.gateway_name,
            collect_id: order._id,
            last_checked_at: orderStatus ? orderStatus.updatedAt : null
        });
    } catch (error) {
        console.error("Error fetching transaction status:", error);
        res.status(500).json({
            ok: false,
            message: "Failed to fetch transaction status",
            error: error.message,
        });
    }
}

module.exports = { getTransactions, getTransactionsBySchool, getTransactionStatus };