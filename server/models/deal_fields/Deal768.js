const mongoose = require('mongoose');

const Deal768FieldSchema = new mongoose.Schema({
    deal_name: String,
    lawid: String,
    keeper: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User'
    },
    bailor: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User'
    },
    deal_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DealParent',
        unique: true
    },
    itemname: String,
    awardamount: String,
    responsibility: String,
    additional: String,
    shelfdate:Date,
    payday: String,
    duedate: Date
});


module.exports = mongoose.model('Deal768', Deal768FieldSchema);
