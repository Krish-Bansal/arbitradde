const { createContact, verifyStatus, getAllAdminNames, getAllAuthNames, acceptContract, rejectContract } = require("../controllers/contractController");
const { checkAuth } = require("../middleware/checkAdmin");

const router = require("express").Router();

router.post("/create", checkAuth, createContact);
router.put('/verify-status', verifyStatus)
router.get('/admin-names', checkAuth, getAllAdminNames)
router.get('/auth-names', checkAuth, getAllAuthNames);
router.post('/accept', acceptContract)
router.post('/reject', rejectContract)


module.exports = router;
