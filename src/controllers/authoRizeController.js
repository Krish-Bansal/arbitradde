const AuthoRizeModel = require("../models/AuthoRizeModel");
const Token = require("../models/tokenSchema");
const { createJwt } = require("../utils/jwt_token");
// const { v4: uuidv4 } = require("uuid");
const sendEmail = require("../utils/email/sendEmail");
const authoRizeUserCreate = async (req, res) => {
  try {
    const {
      nameOfUser, aadharNo, emailId, whatsAppNo, nickName
    } = req.body
    // const randomUUID = uuidv4();
    // const randomPassword = randomUUID.substr(0, 4);
    // const mPassword = randomPassword;
    const authoRizeData = new AuthoRizeModel({
      nameOfUser,
      aadharNo,
      email: emailId,
      whatsAppNumber: whatsAppNo,
      nickName,
      authorityLetter: req.body.authorityLetter ?? '',
      createdBy: req.user._id,
      // mPassword: mPassword
    })
    const data = await authoRizeData.save();

    // Replace 'id' with 'data._id' in the frontendMPIN URL
    // const frontendMPIN = `https://arbi-front-five.vercel.app/set-mpin/${data._id}`;
    const frontendMPIN = `http://localhost:3000/set-mpin/${data._id}`;

    await sendEmail(emailId, "Set your MPIN from the link below.", { link: frontendMPIN }, "./template/password.handlebars")
    return res.status(201).json(data)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ msg: error.message })
  }
};

const setMpin = async (req, res) => {
  try {
    const { id } = req.params; // Assuming the ID is in the request parameters

    // Find the user in the database by ID
    const user = await AuthoRizeModel.findById(id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if the user already has an MPIN
    if (user.mpin) {
      return res.status(400).json({ msg: 'MPIN already set for this user' });
    }

    // Get the MPIN from the request body
    const { mpin } = req.body;

    // Check if the MPIN is a 4-digit number
    if (!/^\d{4}$/.test(mpin)) {
      return res.status(400).json({ msg: 'Invalid MPIN format. It should be a 4-digit number' });
    }

    // Update the user's MPIN and isActive status
    user.mPassword = mpin;
    user.isActive = true;

    // Save the updated user in the database
    await user.save();

    return res.status(200).json({ msg: 'MPIN set successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: error.message });
  }
};


const loginAuth = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body
    const userData = await AuthoRizeModel.findOne({ email })
    if (!userData) {
      return res.status(401).json({
        status: 'failure',
        error: "data doesn't found!"
      })
    }
    if (password !== userData?.mPassword) {
      return res.status(401).json({
        status: 'failure',
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
    return res.status(500).json({ error: error.message })
  }
};

const getAuthorisedUsers = async (req, res) => {
  try {
    const userId = req.user._id; // Get the logged-in user's ID from req.user
    // Fetch authorized users associated with the logged-in user's ID
    const authorizedUsers = await AuthoRizeModel.find({ createdBy: userId });
    res.json(authorizedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching authorized users.' });
  }
}

const removeAuthorisedUsers = async (req, res) => {
  try {
    const authId = req.params.id; // Get authId from the URL parameter
    const removedUser = await AuthoRizeModel.findByIdAndRemove(authId);
    if (!removedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Error Removing Authorised User:', error);
    res.status(500).json({ message: 'Error Removing Authorised User' });
  }
};




module.exports = {
  authoRizeUserCreate,
  loginAuth,
  getAuthorisedUsers,
  removeAuthorisedUsers,
  setMpin
}