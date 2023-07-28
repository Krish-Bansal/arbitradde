const AuthoRizeModel = require("../models/AuthoRizeModel");
const UserModel = require("../models/UserModel");
const { decryptToken } = require("../utils/jwt_token");

const checkAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization
    const decryptedData = await decryptToken(token);
    if(decryptedData){
      const adminData = await UserModel.findOne({email: decryptedData.email})
      if(adminData){
        req.user = adminData;
        next()
      }else{
        return res.status(401).json({status: "failure", error: "data doesn't found!"})
      }
    }else{
      return res.status(401).json({status: "failure", error: "data doesn't found!"})
    }
  } catch (error) {
    return res.status(500).json({status: "failure", error: error.message});
  }
};

const checkAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization
    const decryptedData = await decryptToken(token);
    if(decryptedData){
      const authData = await AuthoRizeModel.findOne({email: decryptedData.email})
      if(authData){
        req.user = authData;
        next()
      }else{
        return res.status(401).json({status: "failure", error: "data doesn't found!"})
      }
    }else{
      return res.status(401).json({status: "failure", error: "data doesn't found!"})
    }
  } catch (error) {
    return res.status(500).json({status: "failure", error: error.message});
  }
};
module.exports = {
  checkAdmin, 
  checkAuth
}