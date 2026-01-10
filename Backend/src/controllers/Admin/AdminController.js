const DataModel=require('../../models/Admin/AdminModel')
const AdminCreateService=require('../../services/admin/AdminCreateService')
const AdminLoginService=require('../../services/admin/AdminLoginService')
const AdminUpdateService = require('../../services/admin/AdminUpdateService')
const AdminDetailsService = require('../../services/admin/AdminDetailsService')
const AdminVerifyEmailService = require('../../services/admin/AdminVerifyEmailService')
const AdminVerifyOtpService = require('../../services/admin/AdminVerifyOtpService')
const OTPSModel = require('../../models/Admin/OTPSModel')
const AdminResetPassService = require('../../services/admin/AdminResetPassService')

exports.Registration=async(req,res)=>{
    let Result=await AdminCreateService(req,DataModel)
    res.status(200).json(Result)
}

exports.Login=async(req,res)=>{
    let Result=await AdminLoginService(req,DataModel)
    res.status(200).json(Result)
}

exports.ProfileUpdate=async(req,res)=>{
    let Result=await AdminUpdateService(req,DataModel)
    res.status(200).json(Result)
}

exports.ProfileDetails=async(req,res)=>{
    let Result=await AdminDetailsService(req,DataModel)
    res.status(200).json(Result)
}

exports.RecoverVerifyEmail=async(req,res)=>{
    let Result=await AdminVerifyEmailService(req,DataModel)
    res.status(200).json(Result)
}

exports.RecoverVerifyOTP=async(req,res)=>{
    let Result=await AdminVerifyOtpService(req,OTPSModel)
    res.status(200).json(Result)
}

exports.RecoverResetPass=async(req,res)=>{
    let Result=await AdminResetPassService(req,OTPSModel)
    res.status(200).json(Result)
}