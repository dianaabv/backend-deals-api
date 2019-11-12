const mongoose = require('mongoose');

const RelationSchema = new mongoose.Schema({
    iam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    myfriend: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: String
});


module.exports = mongoose.model('Relation', RelationSchema);
