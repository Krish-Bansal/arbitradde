const UserModel = require("../models/UserModel");
const Token = require("../models/tokenSchema");
const sendEmail = require("../utils/email/sendEmail");
const { createJwt } = require("../utils/jwt_token");
const uploadImage = async(req, res)=>{
  try {
    const { filename, path, mimetype } = req.file;
    console.log(req.file)
    res.status(201).json({filename})
  } catch (error) {
    res.status(500).json({
      msg: error.message
    })
  }
}

const userCreateFunction = async (req, res) => {
  try {
    const {
      registerAs,
      nameOfEntity,
      typeOfEntity,
      mobileNumber,
      whatsAppNumber,
      email,
      gstin,
      gstinFile,
      pan,
      panFile,
      entityRegistrationNo,
      entityRegistrationFile,
      userId,
      password
    } = req.body;
    const userData = new UserModel({
      registerAs,
      nameOfEntity,
      typeOfEntity,
      address:{
        landmark: req.body.landmark,
        city: req.body.city,
        state: req.body.state,
        pin: req.body.pin
      },
      mobileNumber,
      whatsAppNumber,
      email,
      gstin,
      gstinFile,
      pan,
      panFile,
      entityRegistrationNo,
      entityRegistrationFile,
      userId,
      password
    })
    const data = await userData.save();
    let generateToken = await createJwt(req.body.email)
    const tokenData = new Token({
      userId: data._id.toString(),
      token: generateToken
    })
    await tokenData.save()
    let welcomeLink = 'http://localhost:3000/user/email-verification?token=' + generateToken
    await sendEmail(req.body.email, "verify the gmail", { name: req.body.userId, link: welcomeLink }, "./template/welcome.handlebars")
    
    return res.status(201).json(data)
  } catch (error) {
    console.log(error)
    return res.status(500).json({msg: error})
  }
};

const updateProfile = async(req, res)=>{
  try {
    const userSearch = await UserModel.findOne({userId: req.params.userId})
    if(userSearch){
      const user = await UserModel.findOneAndUpdate({userId: req.params.userId}, req.body, { new: true });
      res.status(200).json(user);
    }else{
      return res.status(402).json({msg: "client data doesn't exist!"})
    }
  } catch (error) {
    return res.status(500).json({msg: error.message})
  }
}

const emailVerify = async (req, res) => {
  try {
      let doc = await UserModel.findOneAndUpdate({ email: req.query.email },
        { isActive: true, isAdmin:true },
        {
          new: true
        }); 
      res.status(200).json(doc)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'server is poor!' })
  }
}

const loginFunction = async(req, res)=>{
  try {
    const {email, password} = req.body;
    const userData = await UserModel.findOne({email: email, isActive: true, password: password});
    if(userData){
      let generateToken = createJwt(email)
      const tokenData = new Token({
        userId: userData._id.toString(),
        token: generateToken
      })
      await tokenData.save()
      res.status(200).json({
        msg:"success",
        data: generateToken
      })
    }else{
      return res.status(401).json({
        msg: "you have entered wrong data!"
      })
    }
  } catch (error) {
    res.status(500).json({
      msg: error.message
    })
  }
}
module.exports = {
  userCreateFunction,
  updateProfile,
  uploadImage,
  emailVerify,
  loginFunction
}