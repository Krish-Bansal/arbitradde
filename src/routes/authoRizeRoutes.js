const { authoRizeUserCreate, loginAuth } = require("../controllers/authoRizeController");
const { checkAdmin } = require("../middleware/checkAdmin");

const router = require("express").Router();

router.post('/create', checkAdmin, authoRizeUserCreate)
// router.patch('/update-profile', updateProfile);
router.post('/login', loginAuth)
module.exports = router;