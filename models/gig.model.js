const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gigBasicSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    payStruct: {
        type: String,
        required: true
    },
    orders: {
        pending: {
            type: Number,
            required: false,
            default: 0
        },   
        active: {
            type: Number,
            required: false,
            default: 0
        },   
        completed: {
            type: Number,
            required: false,
            default: 0
        },   
        cancelled: {
            type: Number,
            required: false,
            default: 0
        }
    },
    totalIncome: {
        type: Number,
        required: true
    },
    estDeliveryTime: {
        required: true,
        type: String
    }
})

module.exports = mongoose.model('GigBasic', gigBasicSchema);