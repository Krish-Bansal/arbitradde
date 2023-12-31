const { createContact, verifyStatus, getAllAdminNames, getAllAuthNames, acceptContract, rejectContract, getRepresentative, getRepresentative2, retrieveEmail, getPendingContract, getExecutedContract } = require("../controllers/contractController");
const { checkAuth } = require("../middleware/checkAdmin");

const router = require("express").Router();

router.post("/create", checkAuth, createContact);
router.put('/verify-status', verifyStatus)
router.get('/admin-names', checkAuth, getAllAdminNames)
router.get('/auth-names', checkAuth, getAllAuthNames);
router.post('/accept', checkAuth, acceptContract)
router.post('/reject', checkAuth, rejectContract)
router.get('/representative', getRepresentative)
router.get('/representative2', getRepresentative2)
router.post('/get-email', retrieveEmail)
router.get('/pending-contracts', checkAuth, getPendingContract)
router.get('/executed-contracts', checkAuth, getExecutedContract)



module.exports = router;
