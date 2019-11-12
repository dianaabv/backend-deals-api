const mongoose = require('mongoose');

const Deal688OldSchema = new mongoose.Schema({
    deal_name: String,
    lawid: String,
    deal_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DealParent',
        unique: true
    },
    сarrier: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User'
    },
    sender: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User'
    },
    transportableproperty: String,
    shippingaddress: String,
    payday: String,
    deliveryaddress: String,
    recipientofproperty: String,
    shippingprice: String,
    additional: String,

    shippingday:Date,
    duedate: Date
});


module.exports = mongoose.model('Deal688Old', Deal688OldSchema);