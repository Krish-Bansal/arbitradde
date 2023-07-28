const { createContact, verifyStatus } = require("../controllers/contractController");

const router = require("express").Router();

router.post("/create", createContact);
router.put('/verify-status', verifyStatus)
module.exports = router;
