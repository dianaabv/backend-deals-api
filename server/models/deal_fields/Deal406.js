const mongoose = require('mongoose');

const Deal406FieldSchema = new mongoose.Schema({
  deal_name: String,
  lawid: String,
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  buyer: {
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
  price: String,
  payday: String,
  getbackday: String,
  quality: String,
  description: String,
  state: String,

  expire: String,
  complexity: String,
  additional: String,
  duedate: Date,
});


module.exports = mongoose.model('Deal406', Deal406FieldSchema);
