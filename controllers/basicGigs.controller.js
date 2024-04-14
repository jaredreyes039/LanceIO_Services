const mongoose = require('mongoose');
const GigBasic = require('../models/gig.model');
const { tokenVerificationWrapper } = require('../middleware/auth.middleware');
const Order = require('../models/order.model');

exports.createBasicGig = async (req, res) => {
    const {
        token,
        user_id,
        username,
        title,
        description,
        price,
        payStruct,
        currency,
        totalIncome,
        estDeliveryTime
    } = req.body;

    tokenVerificationWrapper(req, res, async () => {
        try {
            const newGig = await GigBasic.create({
                user_id,
                username,
                title,
                description,
                price,
                payStruct,
                currency,
                totalIncome,
                estDeliveryTime
            })
            res.status(200).send({
                message: "Gig created successfully"
            })
        }
        catch (err) {
            console.log(err)
            return res.status(500).json({ message: "Internal Server Error" })
        }
    }, token)
}

exports.clearGigsDev = async (req, res) => {
    try {
        await GigBasic.deleteMany({})
        res.status(200).send({
            message: "Gigs cleared successfully"
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

exports.updateBasicGig = async (req, res) => {
    const {
        _id,
        token,
        user_id,
        title,
        description,
        price,
        payStruct,
        currency,
        totalIncome,
        estDeliveryTime
    } = req.body;

    console.log(req.body)

    tokenVerificationWrapper(req, res, () => {
        try {
            GigBasic.findOneAndUpdate({ _id }, {
                $set: {
                    title,
                    description,
                    price,
                    payStruct,
                    currency,
                    totalIncome,
                    estDeliveryTime
                }
            }).then((doc) => {
                console.log(doc)
            })

            try {
                Order.find({ service_id: _id }).then((orders) => {
                    console.log(orders)
                    orders.map((order) => {
                        Order.findOneAndUpdate({ _id: order._id }, {
                            "$set": {
                                "payment.price": price
                            }
                        }).then((updatedOrder) => {
                            console.log("Updated: " + updatedOrder)
                        })
                    })
                    res.status(200).send({
                        message: "Gig updated successfully"
                    })
                })
            }
            catch (err) {
                console.log(err)
            }
        }
        catch (err) {
            console.log(err)
            return res.status(500).json({ message: "Internal Server Error" })
        }
    }, token)
}
