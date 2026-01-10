const express = require('express');
const multer = require("multer");
const router = express.Router();

const upload = multer({ dest: "uploads/" });

// ================= MIDDLEWARE =================
const AuthVerifyMiddleware = require('../middlewares/AuthVerifyMiddleware'); // ADMIN
const UserAuthMiddleware = require('../middlewares/UserAuthMiddleware');     // USERS
const RoleCheckMiddleware = require('../middlewares/RoleCheckMiddleware');

// ================= CONTROLLERS =================

// Admin
const AdminController = require('../controllers/Admin/AdminController');

// Academic
const FacultyController = require('../controllers/Faculties/FacultyController');
const DepartmentController = require('../controllers/Departments/DepartmentController');

// Users
const UsersController = require('../controllers/Users/UsersCreateUpdateController');
const AdminSideUsersController = require('../controllers/Users/AdminSideUsersController');

// Admission
const AdmissionController = require('../controllers/Admission/AdmissionController');

// =================================================
// ================= PUBLIC ROUTES =================
// =================================================

// -------- Admin Auth --------
router.post("/admin/register", AdminController.Registration);
router.post("/admin/login", AdminController.Login);
router.get("/admin/recover/verify-email/:email", AdminController.RecoverVerifyEmail);
router.get("/admin/recover/verify-otp/:email/:otp", AdminController.RecoverVerifyOTP);
router.post("/admin/recover/reset-password", AdminController.RecoverResetPass);

// -------- User Auth --------
router.post("/users/register", UsersController.Registration);
router.post("/users/login", UsersController.Login);
router.get("/users/recover/verify-email/:email", UsersController.RecoverVerifyEmail);
router.post("/users/recover/verify-otp", UsersController.RecoverVerifyOTP);
router.post("/users/recover/reset-password", UsersController.RecoverResetPass);

// -------- Admission (Public) --------
router.post("/admission/apply", AdmissionController.ApplyForAdmission);
router.post("/admission/temporary-login", AdmissionController.TemporaryLogin);

// =================================================
// ============== USER PROTECTED ROUTES =============
// =================================================

// -------- User Profile --------
router.get("/users/profile", UserAuthMiddleware, UsersController.ProfileDetails);
router.post("/users/profile/update", UserAuthMiddleware, UsersController.ProfileUpdate);

// -------- SUPERVISOR PANEL --------
router.get(
  "/admission/supervisor/applications",
  UserAuthMiddleware,
  RoleCheckMiddleware(["Supervisor"]),
  AdmissionController.SupervisorPanelList
);

router.post(
  "/admission/supervisor/decision",
  UserAuthMiddleware,
  RoleCheckMiddleware(["Supervisor"]),
  AdmissionController.SupervisorDecision
);

// -------- CHAIRMAN PANEL --------
router.get(
  "/admission/chairman/applications",
  UserAuthMiddleware,
  RoleCheckMiddleware(["Chairman"]),
  AdmissionController.ChairmanPanelList
);

router.post(
  "/admission/chairman/decision",
  UserAuthMiddleware,
  RoleCheckMiddleware(["Chairman"]),
  AdmissionController.ChairmanDecision
);

// -------- DEAN PANEL --------
router.get(
  "/admission/dean/applications",
  UserAuthMiddleware,
  RoleCheckMiddleware(["Dean"]),
  AdmissionController.DeanPanelList
);

router.post(
  "/admission/dean/decision",
  UserAuthMiddleware,
  RoleCheckMiddleware(["Dean"]),
  AdmissionController.DeanDecision
);

// =================================================
// ============== ADMIN PROTECTED ROUTES =============
// =================================================

// -------- Admin Profile --------
router.get("/admin/profile", AuthVerifyMiddleware, AdminController.ProfileDetails);
router.post("/admin/profile/update", AuthVerifyMiddleware, AdminController.ProfileUpdate);

// -------- Faculty --------
router.post('/faculty', AuthVerifyMiddleware, FacultyController.CreateFaculty);
router.get('/faculty/list/:pageNo/:perPage/:searchKeyword', AuthVerifyMiddleware, FacultyController.ListFaculties);
router.delete('/faculty/:id', AuthVerifyMiddleware, FacultyController.DeleteFaculty);
router.get('/faculty/dropdown', FacultyController.FacultyDropdown);

// -------- Department --------
router.post('/department', AuthVerifyMiddleware, DepartmentController.CreateDepartment);
router.post('/department/:id', AuthVerifyMiddleware, DepartmentController.UpdateDepartment);
router.get('/department/list/:pageNo/:perPage/:searchKeyword', AuthVerifyMiddleware, DepartmentController.ListDepartments);
router.get('/department/:id', AuthVerifyMiddleware, DepartmentController.DepartmentDetailsByID);
router.delete('/department/:id', AuthVerifyMiddleware, DepartmentController.DeleteDepartment);
router.get('/department/dropdown/:facultyID?', DepartmentController.DepartmentDropdown);

// -------- Admission Admin Controls --------
router.post(
  "/admission/season/create",
  AuthVerifyMiddleware,
  AdmissionController.CreateAdmissionSeason
);

router.post(
  "/admission/department-range/create",
  AuthVerifyMiddleware,
  AdmissionController.SetDepartmentRegRange
);

// 🔒 FINAL ENROLLMENT (ADMIN ONLY)
router.post(
  "/admission/finalize-enrollment",
  AuthVerifyMiddleware,
  AdmissionController.FinalizeEnrollment
);

// -------- USERS (ADMIN SIDE) --------
router.get(
  "/admin/users/list/:pageNo/:perPage/:searchKeyword/:role",
  AuthVerifyMiddleware,
  AdminSideUsersController.UsersList
);

router.get(
  "/admin/users/dropdown",
  AuthVerifyMiddleware,
  AdminSideUsersController.UsersDropdown
);

router.get(
  "/admin/users/details/:id",
  AuthVerifyMiddleware,
  AdminSideUsersController.UserDetailsByID
);

router.delete(
  "/admin/users/delete/:id",
  AuthVerifyMiddleware,
  AdminSideUsersController.DeleteUser
);

router.post(
  "/admin/users/send-email",
  AuthVerifyMiddleware,
  upload.array("attachments"),
  AdminSideUsersController.SendEmailToUser
);

module.exports = router;
