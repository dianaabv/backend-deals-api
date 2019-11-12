const mongoose = require('mongoose');

const Deal616OldSchema = new mongoose.Schema({
    deal_name: String, 
    lawid: String,
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deal_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DealParent',
        unique: true
    },
    duedate: Date,
    payday: String,
    workdeadline: Date,
    workdescription: String,
    workaddress: String, 
    workprice: String,
    workcheck:  String,
    quantity: String, 
    additional: String
});


module.exports = mongoose.model('Deal616Old', Deal616OldSchema);
