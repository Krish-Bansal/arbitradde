const ContractModel = require("../models/ContractModel");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Kolkata");
const createContact = async (req, res) => {
  try {
    console.log(req.body)
    const {
      seller,
      sellerRepresentative,
      buyer,
      buyerRepresentative,
      commodity,
      qualityParameters,
      rebateSchedule,
      volume,
      volumePerIns,
      volumeRate,
      incoterm,
      origin,
      destination,
      modeOfTransport,
      deliveryPeriod,
      deliveryBasis,
      price,
      pricePerIns,
      paymentTerm,
      freeTime,
      freeTimePerIns,
      detentionOrDemurrageCharges,
      detentionOrDemurrageChargesPerIns,
      otherTerms,
      applicableRules,
      Amendment,
      disputeResolution,
    } = req.body;
    
    // const createdOn = moment().format("YYYY-MM-DD HH:mm:ss");
    // const [day, month, year] = deliveryPeriod.split("/");
    // const formattedDob = `${year}-${month}-${day}`;

    const data = new ContractModel({
      seller,
      sellerRepresentative,
      buyer,
      buyerRepresentative,
      commodity,
      qualityParameters,
      rebateSchedule,
      volume,
      volumePerIns,
      volumeRate,
      incoterm,
      origin,
      destination,
      modeOfTransport,
      deliveryPeriod: new Date(deliveryPeriod),
      deliveryBasis,
      price,
      pricePerIns,
      paymentTerm,
      freeTime,
      freeTimePerIns,
      detentionOrDemurrageCharges,
      detentionOrDemurrageChargesPerIns,
      otherTerms,
      applicableRules,
      Amendment,
      disputeResolution,
      contractNumber: uuidv4(),
      userId: req.user._id
    });
    const userData = await data.save();
    return res.status(201).json({
      status: "success",
      data: userData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "failure", error: error.message });
  }
};

const verifyStatus = async (req, res) => {
  try {
    const {status, _id} = req.body;
    const updatedUser = await ContractModel.findOneAndUpdate({_id}, {status}, { new: true });
    res.status(200).json({
      status: "success",
      data: updatedUser
    })
  } catch (error) {
    res.status(500).json({ status: "failure", error: error.message });
  }
};

module.exports = {
  createContact,
  verifyStatus,
};
