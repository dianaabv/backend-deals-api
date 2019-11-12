const mongoose = require('mongoose');

const UserTimelineSchema = new mongoose.Schema({
    iam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    from: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User'
    },
    title: String,
    date: String,
    isOpen: String
});


module.exports = mongoose.model('UserTimelineSchema', UserTimelineSchema);
