const mongoose = require('mongoose');

const DealTimelineSchema = new mongoose.Schema({
    deal_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DealParent'
    },
    action_initiator: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User'
    },
    title: String,
    date: String,
    fields: String,
    finals: String,
    role_status: String,
    isOpen: String
});


module.exports = mongoose.model('DealTimeline', DealTimelineSchema);
