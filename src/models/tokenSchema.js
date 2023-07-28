// token schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '12h',// this is the expiry time in seconds
  },
}, { timestamps: true });
const Token = mongoose.model("Token", tokenSchema);
module.exports = Token;