const mongoose = require('mongoose');

const Deal846FieldSchema = new mongoose.Schema({
  deal_name: String,
  lawid: String,
  principal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attorney: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DealParent',
      unique: true
  },
  description: String,
  priceaward: String,
  usecondition: String,
  payday: String,
  rules: String,

  termofassignment: Date,
  additional: String,
  duedate: Date,
});


module.exports = mongoose.model('Deal846', Deal846FieldSchema);
