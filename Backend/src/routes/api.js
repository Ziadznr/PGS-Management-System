const express=require('express')
const multer = require("multer");
const router=express.Router();

const AuthVerifyMiddleware=require('../middlewares/AuthVerifyMiddleware.js')
const UsersController=require('../controllers/Users/UsersController')

// User Profile
router.post("/Registration",UsersController.Registration)
router.post("/Login",UsersController.Login)
router.post("/ProfileUpdate",AuthVerifyMiddleware,UsersController.ProfileUpdate)
router.get("/ProfileDetails",AuthVerifyMiddleware,UsersController.ProfileDetails)
router.get("/RecoverVerifyEmail/:email",UsersController.RecoverVerifyEmail)
router.get("/RecoverVerifyOTP/:email/:otp",UsersController.RecoverVerifyOTP)
router.post("/RecoverResetPass",UsersController.RecoverResetPass)





module.exports=router;
