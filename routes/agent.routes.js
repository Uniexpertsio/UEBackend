const {Router} = require("express");
const {acceptTnc, getGeneralInformation, updateGeneralInformation, getBankInformation, updateBankInformation, getAccountManager, getDocuments, updateDocuments, updateDocument, getTnC } = require("../controllers/Agent");
const Middleware = require("../controllers/Middleware");

const router = Router();

router.get("/tnc", getTnC);

///to add a route to send /accept-tnc to salesforce 



router.post("/accept-tnc",  Middleware.checkAuth, acceptTnc);
router.get("/general-information",  Middleware.checkAuth, getGeneralInformation);
router.patch("/general-information",  Middleware.checkAuth, updateGeneralInformation);
router.get("/bank-information", Middleware.checkAuth, getBankInformation);
router.patch("/bank-information", Middleware.checkAuth, updateBankInformation);
router.get("/account-manager", Middleware.checkAuth, getAccountManager);
router.get("/documents", Middleware.checkAuth, getDocuments);
router.patch("/documents", Middleware.checkAuth, updateDocuments);
router.patch("/document/:documentId", Middleware.checkAuth, updateDocument);


module.exports = router;
