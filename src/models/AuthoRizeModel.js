const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    nameOfUser: { type: String, required: true },
    aadharNo: { type: String, required: true, unique: true },  
    email: { type: String, required: true, unique: true },
    whatsAppNumber: {
      type: String,
    },
    nickName: { type: String },
    authorityLetter: { type: String },
    createdBy:{type: mongoose.Schema.Types.ObjectId},
    isActive: { type: Boolean, default: false },
    mPassword: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("authorize", UserSchema);
