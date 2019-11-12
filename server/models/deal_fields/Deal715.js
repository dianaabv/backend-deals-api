const mongoose = require('mongoose');

const Deal715FieldSchema = new mongoose.Schema({
    deal_name: String, 
    lawid: String,
    giver: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User'
    },
    borrower: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User'
    },
    deal_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DealParent',
        unique: true
    },
    loanterm: Date,
    loanamount: String,
    awardamount: String,
    additional: String,
    duedate: Date,
    deadline: String
});


module.exports = mongoose.model('Deal715', Deal715FieldSchema);
