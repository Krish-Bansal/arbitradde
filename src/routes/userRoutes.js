const { userCreateFunction, updateProfile, uploadImage, emailVerify, loginFunction } = require("../controllers/UserController");
const { multerStorage } = require("../utils/fileUpload");
const multer = require('multer')
const router = require("express").Router();
// router.post('/image', ImageUpload)
const upload = multer({ storage: multerStorage("/images") });
router.post('/file-upload', upload.single('image'), uploadImage)
router.post('/create', userCreateFunction)
router.patch('/update-profile', updateProfile);
router.patch('/email-verify', emailVerify)
router.post('/login', loginFunction)
module.exports = router;