const mongoose = require("mongoose");

const ContractSchema = new mongoose.Schema(
  {
    userId:{type: mongoose.Schema.Types.ObjectId},
    seller: { type: String },
    sellerRepresentative: { type: String },
    buyer: { type: String },
    buyerRepresentative: {
      type: String,
    },
    commodity: { type: String },
    qualityParameters: { type: String },
    rebateSchedule: { type: String },
    volume: { type: Number },
    volumePerIns: { type: String },
    volumeRate: { type: Number },
    incoterm: { type: String },
    origin: { type: String},
    destination: { type: String},
    modeOfTransport: {
      type: String,
    },
    deliveryPeriod: { type: Date },
    deliveryBasis: { type: String },
    price: { type: Number },
    pricePerIns: {type: String },
    paymentTerm: { type: String },
    freeTime: { type: Number },
    freeTimePerIns: { type: String },
    detentionOrDemurrageCharges: { type: Number },
    detentionOrDemurrageChargesPerIns: { type: String },
    otherTerms: { type: String },
    applicableRules: { type: String },
    Amendment: { type: String },
    disputeResolution: {
      type: String,
    },
    contractNumber:{
      type: String,
    },
    isProcessComplete: {type:Boolean, default: false},
    status:{ type:String, enum: ["approve", "reject", "change"]}
  },
  { timestamps: true }
);

module.exports = mongoose.model("contract", ContractSchema);
