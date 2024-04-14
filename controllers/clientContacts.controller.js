const uuid = require('uuid');
const clientContactModel = require('../models/clientContact.model');
const { upload } = require('../server');

exports.addClientContact = (req, res) => {
    const clientContact = new clientContactModel({
        user_id: req.body.user_id,
        _id: uuid.v4(),
        name: req.body.name,
        bio: req.body.bio,
        email: req.body.email,
        phone: req.body.phone,
        connection: req.body.connection,
        notes: req.body.notes,
        orders: req.body.orders
    });
    clientContact.save()
        .then((data) => {
            res.json(data);
        })
        .catch(err => {
            res.json({ message: err });
        });
}

exports.getContactsByUserId = (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        res.status(400).json({ message: "Missing user_id in request" })
    }

    clientContactModel.find({ user_id: user_id })
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(200).json({ message: err });
        });
}
