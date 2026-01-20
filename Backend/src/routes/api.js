const express = require("express");
const multer = require("multer");
const router = express.Router();

const upload = multer({ dest: "uploads/" });

// ================= MIDDLEWARE =================
const AuthVerifyMiddleware = require("../middlewares/AuthVerifyMiddleware"); // ADMIN
const UserAuthMiddleware = require("../middlewares/UserAuthMiddleware");     // USERS
const RoleCheckMiddleware = require("../middlewares/RoleCheckMiddleware");

// ================= CONTROLLERS =================

// Admin
const AdminController =
  require("../controllers/Admin/AdminController");

// Users
const UsersController =
  require("../controllers/Users/UsersCreateUpdateController");
const AdminSideUsersController =
  require("../controllers/Users/AdminSideUsersController");

// Departments
const DepartmentController =
  require("../controllers/Departments/DepartmentController");

// Admission
const AdmissionController =
  require("../controllers/Admission/AdmissionController");
  const DepartmentLastSemesterCourseController =
  require("../controllers/Admission/DepartmentLastSemesterCourseController");
    const AdmissionDocumentController =
  require("../controllers/Admission/AdmissionDocumentController");

// Notice
const NoticeController =
  require("../controllers/Notice/NoticeController");

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
router.post("/users/student-register", UsersController.StudentRegistration);
router.post("/users/login", UsersController.Login);
router.get("/users/recover/verify-email/:email", UsersController.RecoverVerifyEmail);
router.post("/users/recover/verify-otp", UsersController.RecoverVerifyOTP);
router.post("/users/recover/reset-password", UsersController.RecoverResetPass);

// -------- Admission (PUBLIC – no login) --------
router.post("/admission/apply", AdmissionController.ApplyForAdmission);
router.post("/admission/temporary-login", AdmissionController.TemporaryLogin);

// -------- Public Notice --------
router.get("/notice/public/list", NoticeController.PublicList);
router.get("/notice/public/latest", NoticeController.PublicLatest);

const PaymentController =
  require("../controllers/Admission/PaymentController");
const InitiatePaymentService =
  require("../services/admission/InitiatePaymentService");

// =================================================
// ============== USER PROTECTED ROUTES =============
// =================================================

// -------- User Profile --------
router.get(
  "/users/profile",
  UserAuthMiddleware,
  UsersController.ProfileDetails
);

router.post(
  "/users/profile/update",
  UserAuthMiddleware,
  UsersController.ProfileUpdate
);

// =================================================
// ============== SUPERVISOR PANEL =================
// =================================================
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

// =================================================
// ============== CHAIRMAN PANEL ===================
// =================================================
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


// Chairman creates / updates department last semester courses
router.post(
  "/admission/department-last-semester-courses",
  UserAuthMiddleware,
  RoleCheckMiddleware(["Chairman"]),
  DepartmentLastSemesterCourseController.SetDepartmentLastSemesterCourses
);

// List (for update UI)
router.get(
  "/admission/department-last-semester-courses/chairman",
  UserAuthMiddleware,
  RoleCheckMiddleware(["Chairman"]),
  DepartmentLastSemesterCourseController.DepartmentCourseList
);

/* =================================================
   PUBLIC (STUDENT APPLICATION)
================================================= */

// Get last semester courses by department
router.get(
  "/admission/department-last-semester-courses/:departmentId",
  DepartmentLastSemesterCourseController.GetDepartmentLastSemesterCourses
);

// =================================================
// ============== DEAN PANEL =======================
// =================================================
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
// ============== FINAL ENROLLMENT =================
// =================================================
// 🔓 Uses temporary login (NOT admin-only)
router.post(
  "/admission/finalize-enrollment",
  AdmissionController.FinalizeEnrollment
);

// =================================================
// ============== ADMIN PROTECTED ROUTES ============
// =================================================

// -------- Admin Profile --------
router.get(
  "/admin/profile",
  AuthVerifyMiddleware,
  AdminController.ProfileDetails
);

router.post(
  "/admin/profile/update",
  AuthVerifyMiddleware,
  AdminController.ProfileUpdate
);

// -------- Departments --------
router.post(
  "/CreateDepartment",
  AuthVerifyMiddleware,
  DepartmentController.CreateDepartment
);

router.post(
  "/UpdateDepartment/:id",
  AuthVerifyMiddleware,
  DepartmentController.UpdateDepartment
);

router.get(
  "/DepartmentList/:pageNo/:perPage/:searchKeyword",
  AuthVerifyMiddleware,
  DepartmentController.ListDepartments
);

router.get(
  "/DepartmentDetailsByID/:id",
  AuthVerifyMiddleware,
  DepartmentController.DepartmentDetailsByID
);

router.delete(
  "/dDeleteDepartment/:id",
  AuthVerifyMiddleware,
  DepartmentController.DeleteDepartment
);

router.get(
  "/DepartmentDropdown",
  DepartmentController.DepartmentDropdown
);

// =================================================
// ============== ADMISSION ADMIN ==================
// =================================================

// Admission season
router.post(
  "/admission/season/create",
  AuthVerifyMiddleware,
  AdmissionController.CreateAdmissionSeason
);

router.get(
  "/admission/season/list",
  AuthVerifyMiddleware,
  AdmissionController.AdmissionSeasonList
);

router.post(
  "/admission/season/lock/:seasonId",
  AuthVerifyMiddleware,
  AdmissionController.ToggleSeasonLock
);

// Department registration range
router.post(
  "/admission/department-range/create-update",
  AuthVerifyMiddleware,
  AdmissionController.CreateUpdateDepartmentRange
);

router.get(
  "/admission/department-range/list/:admissionSeason",
  AuthVerifyMiddleware,
  AdmissionController.DepartmentRangeList
);

router.get(
  "/admission/department-range/list",
  AuthVerifyMiddleware,
  AdmissionController.DepartmentRangeList
);

router.delete(
  "/admission/department-range/delete/:id",
  AuthVerifyMiddleware,
  AdmissionController.DeleteDepartmentRange
);

// =================================================
// ============== ADMIN USER MANAGEMENT =============
// =================================================
router.post(
  "/admin/users/create",
  AuthVerifyMiddleware,
  AdminSideUsersController.AdminCreateUser
);

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

router.get(
  "/users/supervisors/:departmentId",
  UsersController.SupervisorDropdown
);


// =================================================
// ============== ADMIN NOTICE ======================
// =================================================
router.post(
  "/notice/create",
  AuthVerifyMiddleware,
  NoticeController.Create
);

router.post(
  "/notice/update/:id",
  AuthVerifyMiddleware,
  NoticeController.Update
);

router.post(
  "/notice/pin/:id",
  AuthVerifyMiddleware,
  NoticeController.TogglePin
);

router.post(
  "/notice/lock/:id",
  AuthVerifyMiddleware,
  NoticeController.ToggleLock
);

router.delete(
  "/notice/delete/:id",
  AuthVerifyMiddleware,
  NoticeController.Delete
);

router.get(
  "/notice/admin/list",
  AuthVerifyMiddleware,
  NoticeController.AdminList
);

// -------- PUBLIC ADMISSION SEASONS --------
router.get(
  "/admission/season/public",
  AdmissionController.PublicAdmissionSeasons
);


/* INIT PAYMENT */
router.post(
  "/payment/initiate",
  InitiatePaymentService
);

/* CALLBACKS */
router.post(
  "/payment/success/:tran_id",
  PaymentController.Success
);

router.post(
  "/payment/fail/:tran_id",
  PaymentController.Fail
);

router.post(
  "/payment/cancel/:tran_id",
  PaymentController.Cancel
);

router.post(
  "/admission/upload-documents",
  upload.array("documents", 20),
  AdmissionDocumentController
);





module.exports = router;
