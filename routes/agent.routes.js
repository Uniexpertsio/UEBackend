const {Router} = require("express");
const {acceptTnc, getGeneralInformation, updateGeneralInformation, getBankInformation, updateBankInformation, getAccountManager, getDocuments, updateDocuments, updateDocument, getTnC, downloadTncData } = require("../controllers/Agent");
const Middleware = require("../controllers/Middleware");

const router = Router();

router.get("/tnc/:sfId", getTnC);

///to add a route to send /accept-tnc to salesforce 



router.post("/accept-tnc",  Middleware.checkAuth, acceptTnc);
router.get("/download-tnc/:sfId/:ip", downloadTncData);
router.get("/general-information",  Middleware.checkAuth, getGeneralInformation);
router.put("/general-information",  Middleware.checkAuth, updateGeneralInformation);
router.get("/bank-information", Middleware.checkAuth, getBankInformation);
router.put("/bank-information", Middleware.checkAuth, updateBankInformation);
router.get("/account-manager", Middleware.checkAuth, getAccountManager);
router.get("/documents", Middleware.checkAuth, getDocuments);
router.put("/documents", Middleware.checkAuth, updateDocuments);
router.put("/document/:documentId", Middleware.checkAuth, updateDocument);


module.exports = router;
