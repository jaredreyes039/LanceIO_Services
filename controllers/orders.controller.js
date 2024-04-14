const { tokenVerificationWrapper } = require('../middleware/auth.middleware');
const Order = require('../models/order.model');
const GigBasic = require('../models/gig.model');
const clientContactModel = require('../models/clientContact.model');

async function updateGigOrderCount(id) {
    try {
        await GigBasic.findOneAndUpdate({ _id: id }, { $inc: { "orders.pending": 1 } })
        return 1;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}

async function updateGigTotalIncome(id, income) {
    try {
        await GigBasic.findOneAndUpdate({ _id: id }, { $inc: { totalIncome: income } })
        return 1;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}

exports.createOrder = async (req, res) => {
    let {
        clientId,
        userId,
        serviceId,
        clientRequests,
        orderRequirements,
        payment,
        delDate,
        payDate,
        additionalNotes
    } = req.body

    // Fill in Payment Object
    // For right now, I really dont want users in the front-end to have the control over initial amountOwed and amountPaid as it should be relative to the price and payStruct
    payment = { ...payment, amountOwed: (payment.pay_struct === "fixed" ? payment.price : 0), amountPaid: 0 }
    try {
        if (userId === "" || clientId === "" || serviceId === "") {
            console.log("Missing info")
            res.status(400).json({ message: "Missing required fields. Please try again later. If this appears to be an error contact support." })
        }
        let orderNum;
        try {
            let orders = await Order.find({ user_id: userId })
            if (orders.length > 0) {
                orderNum = orders[orders.length - 1].order_num + 1;
            }
            else {
                orderNum = 0
            }
        }
        catch (err) {
            console.log(err)
            res.status(400).json({ message: "Failed to create order, please try again later." })
        }
        const order = await Order.create({
            user_id: userId,
            client_id: clientId,
            service_id: serviceId,
            order_num: orderNum,
            package: {
                isPackage: false,
                package_id: ""
            },
            clientRequests,
            orderRequirements,
            payment,
            deliveryDate: new Date(delDate),
            paymentDatePref: new Date(payDate),
            additionalNotes
        })
        let servStatusA = await updateGigOrderCount(serviceId)
        let servStatusB = await updateGigTotalIncome(serviceId, payment.price)
        if (servStatusA && servStatusB) {
            try {
                clientContactModel.findOneAndUpdate({ _id: clientId }, { $push: { orders: order._id } })
                res.status(200).json({ message: "", order: order })
            }
            catch (err) {
                // Undo functions need to be implemented, though Im tempted to wait until I move this to an ACID transaction
                console.log(err)
                res.status(400).json({ message: "Test failed" })
            }
        }
        else {
            try {
                Order.deleteOne({ user_id: userId, client_id: clientId, service_id: serviceId, payment: payment })
                res.status(400).json({ message: "Failed to update services, order not created. Please try again later." })
            }
            catch (err) {
                console.log(err)
                res.status(400).json({ message: "Failed to repair data, contact a server administrator." })
            }

        }
    }
    catch (err) {
        res.status(400).json({ message: err });
    }

}

exports.getOrderByUserId = async (req, res) => {
    let { userId, token } = req.params
    tokenVerificationWrapper(req, res, async () => {
        try {
            const orders = await Order.find({ user_id: userId })
            res.status(200).json(orders)
        }
        catch (err) {
            console.log(err)
            return res.status(500).json({ message: "Internal Server Error" })
        }
    }, token)

}

exports.getOrderByOrderId = async (req, res) => {
    let { orderId, token } = req.params

    tokenVerificationWrapper(req, res, async () => {
        try {
            const orders = await Order.find({ _id: orderId })
            res.status(200).json(orders)
        }
        catch (err) {
            console.log(err)
            return res.status(500).json({ message: "Internal Server Error" })
        }
    }, token)
}

exports.updateOrderStatus = async (req, res) => {
    let { order_id, service_id, token, status } = req.body;
    let newOrderStatus;
    let oldOrderStatus;
    console.log("Update order status...")
    console.log("Checking token...")
    tokenVerificationWrapper(req, res, async () => {
        try {
            console.log("Attempting order update...")
            let oldOrder = await Order.findById({ _id: order_id })
            if (oldOrder) {
                oldOrderStatus = Object.keys(oldOrder.order_status).find(key => { return oldOrder.order_status[key] === 1 })
                newOrderStatus = Object.keys(status).find(key => { return status[key] === 1 })
            }

            let updatedOrder = await Order.findByIdAndUpdate(
                { _id: order_id },
                { $set: { order_status: status } },
                { new: true }
            )
            if (updatedOrder) {
                console.log("Updated order, attempting service order counts update...")
                try {
                    console.log("Searching for service of status:" + oldOrderStatus + newOrderStatus)
                    let updatedService = await GigBasic.findOneAndUpdate(
                        { _id: service_id },
                        { $inc: { [`orders.${newOrderStatus}`]: 1, [`orders.${oldOrderStatus}`]: -1 } }
                    )
                    console.log(updatedService.orders)
                    if (updatedService) {
                        console.log("Order status and counts updated successfully!")
                        res.status(200).json({ message: "Order status and counts updated successfully!" })
                    }
                    else {
                        console.log("Failed to update service order counts, undoing changes to order status...")
                        try {
                            console.log("Reverting order...")
                            let revertedOrder = await Order.findByIdAndUpdate(
                                { _id: order_id },
                                { $set: { order_status: status } }
                            )
                            if (revertedOrder) {
                                console.log("Order reverted, data integrity and validity maintained. Contact system admin. [ERR-COUNTS_NOT_UPDATED]")
                                res.status(200).json({ message: "Data fixed successfully, please contact a system admin for more information on this error [ERR-COUNTS_NOT_UPDATED]." })
                            }
                            else {
                                console.log("Fatal error")
                                res.status(400).json({ message: "Fatal error, contact a system admin. [ERR-COUNTS_NOT_UPDATED]" })
                            }
                        }
                        catch (err) {
                            res.status(420).json({ message: "Fatal error, contact a system admin. [ERR-COUNTS_NOT_UPDATED]" })
                        }
                    }
                }
                catch (err) {
                    res.status(400).json({ message: "Failed to update order counts, updates to order undone. [ERR-COUNTS_NOT_UPDATED]" })
                }
            }
            else {
                res.status(400).json({ message: "Order not found [ERR-ORDER_NOT_FOUND]" })
            }
        }
        catch (err) {
            console.log(err)
            return res.status(500).json({ message: "Internal Server Error [ERR-ORDER_STATUS_UPDATE_INTERNAL_FAILURE]" })
        }
    }, token)
}

exports.addPlanningTask = async (req, res) => {
    let { order_id, token, task } = req.body;
    console.log(req.body)
    tokenVerificationWrapper(req, res, async () => {
        let updatedOrder = await Order.findByIdAndUpdate({ _id: order_id }, {
            $push: {
                plannedTasks: {
                    order_id: order_id,
                    task: task,
                    isChecked: false,
                    task_id: new Date().getTime().toString()
                }
            }
        }, { new: true })
        if (updatedOrder) {
            console.log("Added planning task for " + order_id);
            res.status(200).json(updatedOrder)
        }
        else {
            res.status(400).json({ message: "Order not found" })
        }
    }, token)
}

exports.updateTaskTimeAndName = async (req, res) => {
    let { order_id, token, task_id, time, taskName } = req.body
    console.log("Storing time to task " + { task_id })
    tokenVerificationWrapper(req, res, async () => {
        try {
            let order = await Order.findById({ _id: order_id })
            let amountOwed;
            console.log(order)
            if (order.payment.pay_struct !== "fixed") {
                amountOwed = order.payment.price * (time * (1 / 1000) * (1 / 3600))
                amountOwed = amountOwed
            }
            else {
                amountOwed = 0
            }
            let updatedTask = await Order.findByIdAndUpdate({ _id: order_id }, {
                $set: { "plannedTasks.$[element].task": taskName, "plannedTasks.$[element].time": time },
                $inc: {
                    "payment.amountOwed": amountOwed
                }
            }, { arrayFilters: [{ "element.task_id": task_id }] })
            if (updatedTask) {
                res.status(200).json(updatedTask)
            }
            else {
                res.status(400).json({ message: "Issue" })

            }
        }
        catch (err) {
            console.log(err)
        }
    }, token)
}

exports.updateTaskChecked = async (req, res) => {
    let { order_id, token, task_id, checked } = req.body
    console.log(req.body)
    tokenVerificationWrapper(req, res, async () => {
        try {
            let updatedTask = await Order.findByIdAndUpdate({ _id: order_id }, {
                $set: { "plannedTasks.$[element].isChecked": checked }
            }, { arrayFilters: [{ "element.task_id": task_id }] })
            if (updatedTask) {
                res.status(200).json(updatedTask)
            }
            else {
                res.status(400).json({ message: "Issue" })

            }
        }
        catch (err) {
            console.log(err)
        }
    }, token)
}

exports.updateOrderPayment = async (req, res) => {
    let { client_id, order_id, token, payment, paymentDate } = req.body
    tokenVerificationWrapper(req, res, async () => {
        payment = Number(payment)
        try {
            let updatedOrder = await Order.findOneAndUpdate({ _id: order_id }, {
                $inc: {
                    "payment.amountPaid": payment,
                    "payment.amountOwed": -payment
                }, $push: {
                    "paymentRecord": [
                        paymentDate,
                        payment
                    ]
                }
            })
            if (updatedOrder) {
                res.status(200).json({ message: "Successfully updated client payment record." })
            }
            else {
                res.status(400).json({ message: "Failed to update payment, please try again later." })
            }
        }
        catch (err) {
            res.status(400).json({ message: "Failed to update payment, please try again ,later." })
            console.log(err)
        }
    }, token)
}
