const mongoose = require('mongoose');

const Deal683Schema = new mongoose.Schema({
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
    deadline: Date,

    description: String,
    price: String,
    quality: String,
    paydeadline: String, 
    additional: String
});


module.exports = mongoose.model('Deal683', Deal683Schema);
