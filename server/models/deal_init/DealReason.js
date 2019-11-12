const mongoose = require('mongoose');

const DealReasonSchema = new mongoose.Schema({
    deal_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DealParent'
    },
    action_initiator: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User'
    },
    reason: String,
    date: Date
});


module.exports = mongoose.model('DealReason', DealReasonSchema);
