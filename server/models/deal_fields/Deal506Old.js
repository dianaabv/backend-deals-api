const mongoose = require('mongoose');

const Deal506OldSchema = new mongoose.Schema({
    deal_name: String,
    lawid: String,
    presenter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deal_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DealParent',
        unique: true
    },
    itemname: String,
    quantity: String,
    additional: String,
    deadline: String,
    duedate: Date
});


module.exports = mongoose.model('Deal506Old', Deal506OldSchema);
