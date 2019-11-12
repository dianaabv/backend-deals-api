const mongoose = require('mongoose');

const Deal501FieldSchema = new mongoose.Schema({
  deal_name: String,
  lawid: String,
  side1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  side2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DealParent',
      unique: true
  },
  itemname1: String,
  quantity1: String,
  price1: String,
  quality1: String,
  description1: String,
  state1: String,

  itemname2: String,
  quantity2: String,
  price2: String,
  quality2: String,
  description2: String,
  state2: String,

  deadline: String,
  additional: String,
  duedate: Date,
});


module.exports = mongoose.model('Deal501', Deal501FieldSchema);
