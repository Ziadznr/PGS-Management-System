const DataModel=require('../../models/Users/UsersModel')
const UserCreateService=require('../../services/users/UserCreateService')
const UserLoginService=require('../../services/users/UserLoginService')
const UserUpdateService = require('../../services/users/UserUpdateService')
const UserDetailsService = require('../../services/users/UserDetailsService')
const UserVerifyEmailService = require('../../services/users/UserVerifyEmailService')
const UserVerifyOtpService = require('../../services/users/UserVerifyOtpService')
const OTPSModel = require('../../models/Users/OTPSModel')
const UserResetPassService = require('../../services/users/UserResetPassService')



exports.Registration=async(req,res)=>{
    let Result=await UserCreateService(req,DataModel)
    res.status(200).json(Result)
}

exports.Login=async(req,res)=>{
    let Result=await UserLoginService(req,DataModel)
    res.status(200).json(Result)
}

exports.ProfileUpdate=async(req,res)=>{
    let Result=await UserUpdateService(req,DataModel)
    res.status(200).json(Result)
}

exports.ProfileDetails=async(req,res)=>{
    let Result=await UserDetailsService(req,DataModel)
    res.status(200).json(Result)
}

exports.RecoverVerifyEmail=async(req,res)=>{
    let Result=await UserVerifyEmailService(req,DataModel)
    res.status(200).json(Result)
}

exports.RecoverVerifyOTP=async(req,res)=>{
    let Result=await UserVerifyOtpService(req,OTPSModel)
    res.status(200).json(Result)
}

exports.RecoverResetPass=async(req,res)=>{
    let Result=await UserResetPassService(req,OTPSModel)
    res.status(200).json(Result)
}