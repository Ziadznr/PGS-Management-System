const mongoose = require("mongoose");
const fs = require("fs");

const UsersModel = require("../../models/Users/UsersModel");
const ListService = require("../../services/users/UsersListService");
const DropDownService = require("../../services/users/DropdownService");
const DetailsByIDService = require("../../services/common/DetailsByIDService");
const DeleteService = require("../../services/common/DeleteService");
const SendEmailUtility = require("../../utility/SendEmailUtility");
const AdminCreateUserService = require("../../services/users/AdminCreateUserService");

// ------------------ ADMIN CREATE USER ------------------
exports.AdminCreateUser = async (req, res) => {
  try {
    const result = await AdminCreateUserService(req);

    // service already returns proper status + message
    return res.status(200).json(result);

  } catch (error) {
    console.error("AdminCreateUser Error:", error);
    return res.status(500).json({
      status: "fail",
      data: error.toString()
    });
  }
};


// ------------------ List Users (Admin) ------------------
exports.UsersList = async (req, res) => {
  try {
    const searchKeyword = req.params.searchKeyword || "0";
    const role = req.params.role || "All";

    const SearchRgx = { $regex: searchKeyword, $options: "i" };

    const SearchArray = [
      { name: SearchRgx },
      { email: SearchRgx },
      { phone: SearchRgx },
      { role: SearchRgx }
    ];

    let MatchQuery = {};
    if (role !== "All") {
      MatchQuery.role = role;
    }

    const Result = await ListService(req, UsersModel, SearchArray, MatchQuery);
    return res.status(200).json(Result);

  } catch (error) {
    console.error("UsersList Error:", error);
    return res.status(500).json({ status: "fail", data: error.toString() });
  }
};

// ------------------ Users Dropdown ------------------
exports.UsersDropdown = async (req, res) => {
  try {
    const Result = await DropDownService(
      req,
      UsersModel,
      { _id: 1, name: 1, role: 1, department: 1 }
    );

    return res.status(200).json(Result);

  } catch (error) {
    console.error("UsersDropdown Error:", error);
    return res.status(500).json({ status: "fail", data: error.toString() });
  }
};

// ------------------ User Details by ID ------------------
exports.UserDetailsByID = async (req, res) => {
  try {
    const Result = await DetailsByIDService(req, UsersModel);
    return res.status(200).json(Result);

  } catch (error) {
    console.error("UserDetailsByID Error:", error);
    return res.status(500).json({ status: "fail", data: error.toString() });
  }
};

// ------------------ Delete User ------------------
exports.DeleteUser = async (req, res) => {
  try {
    const deleteID = req.params.id;

    const result = await UsersModel.findByIdAndUpdate(
      deleteID,
      { isActive: false, deactivatedAt: new Date() },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ status: "fail", data: "User not found" });
    }

    return res.status(200).json({
      status: "success",
      data: "User deactivated successfully"
    });

  } catch (error) {
    return res.status(500).json({ status: "fail", data: error.toString() });
  }
};


// ------------------ Send Email to User ------------------
exports.SendEmailToUser = async (req, res) => {
  try {
    const { userId, subject, message } = req.body;
    const files = req.files || [];

    const user = await UsersModel.findById(userId);
    if (!user || !user.email) {
      return res.status(404).json({
        status: "fail",
        data: "User not found or email missing"
      });
    }

    const attachments = files.map(file => ({
      filename: file.originalname,
      path: file.path
    }));

    await SendEmailUtility(
      user.email,
      message,
      subject,
      attachments
    );

    // Cleanup uploaded files
    files.forEach(file => {
      fs.unlink(file.path, err => {
        if (err) console.error("File delete error:", file.path);
      });
    });

    return res.status(200).json({
      status: "success",
      data: `Email sent to ${user.email}`
    });

  } catch (error) {
    console.error("SendEmailToUser Error:", error);
    return res.status(500).json({ status: "fail", data: error.toString() });
  }
};
