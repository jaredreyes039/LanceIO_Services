const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientContactSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false
    },
    connection: {
        type: String,
        required: false
    },
    notes: {
        type: String,
        required: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    last_updated: {
        type: Date,
        default: Date.now
    },
    orders: {
        type: Array,
        required: false
    },
    logoUrl: {
        type: String,
        required: false
    },
    paymentRecord: {
        type: Array,
        required: true,
        default: [["1/1/24", 0]]
    }
}
);

module.exports = mongoose.model('ClientContact', clientContactSchema);
