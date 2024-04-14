const express = require('express');
const ORDER_CONTROLLER = require('../controllers/orders.controller');
const multer = require('multer');
const path = require('path');
const Order = require('../models/order.model');

const ROUTER = express.Router();

const storeEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads/moodboards')
    },
    filename: function(req, file, cb) {
        cb(null, `${file.originalname}`)
    }
})

const checkFileType = function(file, cb) {
    //Allowed file extensions
    const fileTypes = /jpeg|jpg|png|gif|svg/;

    //check extension names
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType && extName) {
        return cb(null, true);
    } else {
        cb("Error: You can Only Upload Images!!");
    }
};

const upload = multer({
    storage: storeEngine,
    limits: { fileSize: 100000000 },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
})



ROUTER.post('/create', ORDER_CONTROLLER.createOrder)
ROUTER.get('/getOrders/:userId/:token', ORDER_CONTROLLER.getOrderByUserId)
ROUTER.post('/updateOrder/status', ORDER_CONTROLLER.updateOrderStatus)
ROUTER.post('/addPlanningTask', ORDER_CONTROLLER.addPlanningTask)
ROUTER.post('/enterTaskTime', ORDER_CONTROLLER.updateTaskTimeAndName)
ROUTER.post('/updateTaskChecked', ORDER_CONTROLLER.updateTaskChecked)
ROUTER.post('/addMoodImage', upload.single('file'), async (req, res) => {
    const updatedOrder = await Order.findByIdAndUpdate({ _id: req.body.order_id },
        { $push: { mood_image_urls: req.file.filename } },
        { new: true });
    if (updatedOrder) {
        res.status(200).json(updatedOrder);
    }
});
ROUTER.post('/addPayment', ORDER_CONTROLLER.updateOrderPayment)
module.exports = ROUTER;
