const { authoRizeUserCreate, loginAuth, getAuthorisedUsers, removeAuthorisedUsers } = require("../controllers/authoRizeController");
const { checkAdmin } = require("../middleware/checkAdmin");

const router = require("express").Router();
router.post('/create', checkAdmin, authoRizeUserCreate)
// router.patch('/update-profile', updateProfile);
router.post('/login', loginAuth)
router.get('/users', checkAdmin, getAuthorisedUsers)
router.delete('/remove-user/:id', checkAdmin, removeAuthorisedUsers)

module.exports = router;