const mongoose = require("mongoose");

const ContractSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId },
    seller: { type: String },
    sellerRepresentative: { type: String },
    sellerEmail: { type: String, required: true },
    buyer: { type: String },
    buyeremail: { type: String, required: true },
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
    origin: { type: String },
    destination: { type: String },
    modeOfTransport: {
      type: String,
    },
    deliveryPeriod: { type: Date },
    deliveryPeriodto: { type: Date },
    deliveryBasis: { type: String },
    price: { type: Number },
    pricePerIns: { type: String },
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
    contractNumber: {
      type: String,
    },
    createdby: { type: String },
    isProcessComplete: { type: Boolean, default: false },
    status: { type: String, enum: ["approve", "reject", "change", "none"], default: "none" },
    approve1: { type: Boolean, default: false },
    approve2: { type: Boolean, default: false },
    pdfFile: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("contract", ContractSchema);
