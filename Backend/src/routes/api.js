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
  const TenureAdminController =
  require("../controllers/Admin/TenureAdminController");

// Users
const UsersController =
  require("../controllers/Users/UsersCreateUpdateController");
const AdminSideUsersController =
  require("../controllers/Users/AdminSideUsersController");
const ChairmanUsersController =
  require("../controllers/Users/ChairmanUsersController");  

  const TenureDeanController =
  require("../controllers/Dean/TenureDeanController"); 
// Departments
const DepartmentController =
  require("../controllers/Departments/DepartmentController");
  const ChairmanManualSelectController =
  require("../controllers/Admission/ChairmanManualSelectController");

// Admission
const AdmissionController =
  require("../controllers/Admission/AdmissionController");
  // const DepartmentLastSemesterCourseController =
  // require("../controllers/Admission/DepartmentLastSemesterCourseController");
    const UploadTempDocumentsController =
  require("../controllers/Admission/UploadTempDocumentsController");

// Notice
const NoticeController =
  require("../controllers/Notice/NoticeController");

  // Decision BluePrint 
const ChairmanDecisionBlueprintController =
  require("../controllers/DecisionBluePrint/ChairmanDecisionBlueprintController");  

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

const HallController =
  require("../controllers/Hall/HallController");  

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



router.get(
  "/chairman/users/supervisors/:searchKeyword",
  UserAuthMiddleware,
  RoleCheckMiddleware(["Chairman"]),
  ChairmanUsersController.ChairmanSupervisorsList
);

router.get(
  "/chairman/DecisionBlueprint",
  UserAuthMiddleware,
  RoleCheckMiddleware(["Chairman"]),
  ChairmanDecisionBlueprintController.ListChairmanDecisionBlueprint
);

router.post(
  "/admission/chairman/manual-select",
  UserAuthMiddleware,
  RoleCheckMiddleware(["Chairman"]),
  ChairmanManualSelectController.ChairmanManualSelect
);


router.get(
  "/admin/tenure/list",
  AuthVerifyMiddleware,
  TenureAdminController.List
);

router.get(
  "/dean/tenure/chairman",
  UserAuthMiddleware,
  RoleCheckMiddleware(["Dean"]),
  TenureDeanController.ListChairman
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

router.get(
  "/dean/users/list/:pageNo/:perPage/:searchKeyword/:role",
  UserAuthMiddleware,
  RoleCheckMiddleware(["Dean"]),
  AdminSideUsersController.UsersList
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
  "/DeleteDepartment/:id",
  AuthVerifyMiddleware,
  DepartmentController.DeleteDepartment
);

router.get(
  "/DepartmentDropdown",
  DepartmentController.DepartmentDropdown
);

router.get(
  "/DepartmentSubjectDropdown/:departmentId",
  DepartmentController.DepartmentSubjectDropdown
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
  "/admin/users/create-update",
  AuthVerifyMiddleware,
  AdminSideUsersController.AdminCreateOrUpdateUser
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
const uploadNotice = require("../utility/noticeUpload");

router.post(
  "/admin/notice/create",
  AuthVerifyMiddleware,
  uploadNotice.single("attachment"),
  NoticeController.Create
);

router.post(
  "/admin/notice/update/:id",
  AuthVerifyMiddleware,
  uploadNotice.single("attachment"),
  NoticeController.Update
);

router.post(
  "/admin/notice/toggle-public/:id",
  AuthVerifyMiddleware,
  NoticeController.TogglePublic
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

const uploadAdmissionDocs =
  require("../utility/uploadAdmissionDocs");

router.post(
  "/admission/upload-temp-documents",
  uploadAdmissionDocs.array("documents", 20),
  UploadTempDocumentsController
);


router.get(
  "/admission/application/pdf/:applicationNo",
  UserAuthMiddleware,
  AdmissionController.DownloadPDF
);
const CheckPaymentService =
  require("../services/admission/CheckPaymentService");

router.post(
  "/payment/check",
  CheckPaymentService
);

router.get(
  "/admission/enrollment/summary",
  AuthVerifyMiddleware,
  AdmissionController.EnrollmentSummary
);

// 🔒 ADMIN
router.post(
  "/admin/hall/create-update",
  AuthVerifyMiddleware,
  HallController.CreateUpdate
);

router.get(
  "/admin/hall/list",
  AuthVerifyMiddleware,
  HallController.List
);

router.delete(
  "/admin/hall/delete/:id",
  AuthVerifyMiddleware,
  HallController.Delete
);

// 🔓 PUBLIC / ADMIN (for Provost dropdown)
router.get(
  "/hall/dropdown",
  HallController.Dropdown
);


module.exports = router;
