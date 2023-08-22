const AuthoRizeModel = require("../models/AuthoRizeModel");
const ContractModel = require("../models/ContractModel");
const UserModel = require("../models/UserModel");
const { decryptToken } = require("../utils/jwt_token");

const checkAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
      const actualToken = token.substring(7); // Removes the "Bearer " prefix
      const decryptedData = await decryptToken(actualToken);
      if (decryptedData) {
        const adminData = await UserModel.findOne({ email: decryptedData.email })
        if (adminData) {
          req.user = adminData;
          next()
        } else {
          return res.status(401).json({ status: "failure", error: "data doesn't found!" })
        }
      }
    }
    else {
      return res.status(401).json({ status: "failure", error: "data doesn't found!" })
    }
  } catch (error) {
    return res.status(500).json({ status: "failure", error: error.message });
  }
};

const checkAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization
    if (token && token.startsWith('Bearer ')) {
      const actualToken = token.substring(7); // Removes the "Bearer " prefix
      const decryptedData = await decryptToken(actualToken);
      if (decryptedData) {
        const authData = await AuthoRizeModel.findOne({ email: decryptedData.email })
        if (authData) {
          req.user = authData;
          next()
        } else {
          return res.status(401).json({ status: "failure", error: "Invalid Token" })
        }
      }
    } else {
      return res.status(401).json({ status: "failure", error: "data doesn't found!" })
    }
  } catch (error) {
    return res.status(500).json({ status: "failure", error: error.message });
  }
};

const verifyPdfAccess = async (req, res, next) => {
  const contractId = req.params.contractid;
  const userEmail = req.user.email; // Assuming you have the user's email in req.user
  console.log(req.user)
  try {
    // Find the contract by ID
    const contract = await ContractModel.findById(contractId);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Find the user's profile by email
    const userProfile = await ProfileModel.findOne({ email: userEmail });

    if (!userProfile) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if the user is authorized to access the PDF
    if (
      contract.creatorUserId === userProfile._id.toString() || // Assuming creatorUserId is the user who created the contract
      contract.buyerEmail === userEmail
    ) {
      next(); // Allow access to the PDF
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }
  } catch (error) {
    console.error('Error verifying PDF access:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
module.exports = {
  checkAdmin,
  checkAuth
}