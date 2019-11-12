const mongoose = require('mongoose');

const DealFinalSchema = new mongoose.Schema({
    deal_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DealParent'
    },
    initiator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acceptor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    initiator_answer: String,
    acceptor_answer: String,
    initiator_message: String,
    acceptor_message: String
});


module.exports = mongoose.model('DealFinal', DealFinalSchema);
