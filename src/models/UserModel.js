const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    registerAs: { type: String, },
    nameOfEntity: { type: String },
    typeOfEntity: { type: String },
    address: 
      {
        city: {
          type: String,
          
        },
        landMark: {
          type: String,
        },
        state: {
          type: String,
          
        },
        pin: {
          type: String,
          
        },
      },
    mobileNumber: {
      type: String,
      
    },
    whatsAppNumber: {
      type: String,
    },
    email: { type: String,  unique: true },
    gstin: { type: String },
    gstinFile: { type: String },
    pan: { type: String, },
    panFile: { type: String, },
    entityRegistrationNo: { type: String, },
    entityRegistrationFile: { type: String, },
    userId: { type: String, },
    password: { type: String, },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("profile", UserSchema);
