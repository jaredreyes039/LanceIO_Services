const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Order = new Schema({
    order_num: {
        type: Number,
        required: true,
        default: 0
    },
    user_id: {
        type: String,
        required: true
    },
    service_id: {
        type: String,
        required: true
    },
    client_id: {
        type: String,
        required: true
    },
    clientRequests: {
        type: String,
        required: false
    },
    orderRequirements: {
        type: String,
        required: false
    },
    package: {
        isPackage: {
            type: Boolean,
            required: true
        },
        package_id: {
            type: String,
            required: false
        },
    },
    payment: {
        differentPayStruct: {
            type: Boolean,
            required: true
        },
        pay_struct: {
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
        amountOwed: {
            type: Number,
            required: true
        },
        amountPaid: {
            type: Number,
            required: true,
            default: 0
        },
        paidOff: {
            type: Boolean,
            required: true,
            default: 0
        }
    },
    order_status: {
        pending: {
            type: Number,
            required: true,
            default: 1
        },
        active: {
            type: Number,
            required: true,
            default: 0
        },
        completed: {
            type: Number,
            required: true,
            default: 0
        },
        cancelled: {
            type: Number,
            required: true,
            default: 0
        }
    },
    deliveryDate: {
        type: Date,
        required: true
    },
    paymentDatePref: {
        type: Date,
        required: true
    },
    paymentRecord: {
        type: Array,
        required: true,
        default: [["1/1/24", 0]]
    },
    additionalNotes: {
        type: String,
        required: false
    },
    plannedTasks: {
        type: Array,
        required: false
    },
    mood_image_urls: {
        type: Array,
        required: false
    },
    created_at: {
        type: Date,
        required: true,
        default: new Date()
    }
})

module.exports = mongoose.model('Order', Order);
