const mongoose = require('mongoose');

const DealStateSchema = new mongoose.Schema({
	lawid: String, 
    initiator: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User'
    },
    acceptor: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User'
    },
    initiator_status: String,
    acceptor_status: String,
    deal_id: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'DealParent',
	    unique: true
    }
});


module.exports = mongoose.model('DealState', DealStateSchema);
