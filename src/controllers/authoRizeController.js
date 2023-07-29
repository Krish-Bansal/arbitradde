const AuthoRizeModel = require("../models/AuthoRizeModel");
const Token = require("../models/tokenSchema");
const { createJwt } = require("../utils/jwt_token");
const { v4: uuidv4 } = require("uuid");
const sendEmail = require("../utils/email/sendEmail");
const authoRizeUserCreate = async (req, res) => {
  try {
    const {
      nameOfUser, aadharNo, emailId, whatsAppNo, nickName
    } =  req.body
    console.log(req.body)
    const mPassword = uuidv4()
    const authoRizeData = new AuthoRizeModel({
      nameOfUser,
      aadharNo,
      email: emailId,
      whatsAppNumber: whatsAppNo,
      nickName,
      authorityLetter: req.body.authorityLetter ?? '',
      // createdBy: req.user._id,
      mPassword: mPassword
    })
    const data = await authoRizeData.save();
    await sendEmail(emailId, "please use this password for login!", { mPassword }, "./template/password.handlebars")
    return res.status(201).json(data)
  } catch (error) {
    console.log(error)
    return res.status(500).json({msg: error.message})
  }
};

const loginAuth = async (req, res) => {
  try {
    const {
      email,
      password
    } =  req.body
    const userData = await AuthoRizeModel.findOne({email})
    if(!userData){
      return res.status(401).json({
        status:'failure',
        error: "data doesn't found!"
      })
    }
    if(password !== userData?.mPassword){
      return res.status(401).json({
        status:'failure',
        error: "data doesn't match!"
      })
    }
    let generateToken = await createJwt(req.body.email)
    const tokenData = new Token({
      userId: userData._id.toString(),
      token: generateToken
    })
    await tokenData.save()
    res.status(200).json({
      status: "success",
      data: generateToken
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({error: error.message})
  }
};
module.exports = {
  authoRizeUserCreate,
  loginAuth
}