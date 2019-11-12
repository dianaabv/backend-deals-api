const mongoose = require('mongoose');

const DealTypesSchema = new mongoose.Schema({
  lawid: {
    type: Number,
    unique: true
  },
  name: String,
  about: String,
  subject: String
});


module.exports = mongoose.model('DealTypes', DealTypesSchema);
