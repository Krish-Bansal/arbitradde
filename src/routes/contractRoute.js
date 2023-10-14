const { createContact, verifyStatus, getAllAdminNames, getAllAuthNames, acceptContract, rejectContract, getRepresentative, getRepresentative2, retrieveEmail } = require("../controllers/contractController");
const { checkAuth } = require("../middleware/checkAdmin");

const router = require("express").Router();

router.post("/create", checkAuth, createContact);
router.put('/verify-status', verifyStatus)
router.get('/admin-names', checkAuth, getAllAdminNames)
router.get('/auth-names', checkAuth, getAllAuthNames);
router.post('/accept', acceptContract)
router.post('/reject', rejectContract)
router.get('/representative', getRepresentative)
router.get('/representative2', getRepresentative2)
router.post('/get-email', retrieveEmail)





module.exports = router;
