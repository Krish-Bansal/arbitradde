const multer = require("multer");
const path = require("path");

const multerStorage = (imagePath) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      let img_path = imagePath ? imagePath : "/images";
      cb(null, path.join(__dirname, `../public${img_path}`));
    },
    filename: function (req, file, cb) {
      const filename = Date.now() + "-" + file.originalname;
      cb(null, filename);
    },
  });
};
module.exports = {
  multerStorage,
};