const { tokenVerificationWrapper } = require("../middleware/auth.middleware");
const GigBasic = require('../models/gig.model');

exports.getGigsByUserId = async (req, res) => {
    const { user_id, token } = req.params;
    console.log(req.params)
    tokenVerificationWrapper(req, res, async () => {
        try {
            const gigs = await GigBasic.find({ user_id: user_id })
            res.status(200).json(gigs)
        }
        catch (err) {
            console.log(err)
            res.status(500).json({ message: "Internal Server Error" })
        }
    }, token)
}
