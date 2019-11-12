const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: Number,
    unique: true
  },
  birthday: String,
  issueddate: String,
  password: String,
  firstname: String,
  lastname: String,
  midname: String,
  //email: String,
  email: {
    type: String,
    unique: true
  },
  udv: Number,
  issuedby: String,
  iin: Number,
  address: String,
  status: String,
  nameip: String,
  noregip: String,
  addressregip: String,
  dateregip: String,
  isRegistered: Boolean,
  myRandom: String
});

UserSchema.methods.comparePassword = function comparePassword(password, callback) {
  bcrypt.compare(password, this.password, callback);
};

module.exports = mongoose.model('User', UserSchema);
