const mongoose = require('mongoose');
let mongooseFieldEncryption = require('mongoose-field-encryption').fieldEncryption;
const TimeSchema = new mongoose.Schema({
    test: String, 
    test_str: String
});

TimeSchema.plugin(mongooseFieldEncryption, {fields: ['test', 'test_str'], secret: 'secret'});

module.exports = mongoose.model('Time', TimeSchema);
