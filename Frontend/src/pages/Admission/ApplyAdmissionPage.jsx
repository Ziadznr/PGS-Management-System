import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProgramSelector from "../../components/Admission/ProgramSelector";
import SeasonSelector from "../../components/Admission/SeasonSelector";
import DepartmentSupervisorSelector from "../../components/Admission/DepartmentSupervisorSelector";
import PersonalInfoForm from "../../components/Admission/PersonalInfoForm";
import AddressForm from "../../components/Admission/AddressForm";
import AcademicInfoForm from "../../components/Admission/AcademicInfoForm";
import AppliedSubjectGPAForm from "../../components/Admission/AppliedSubjectGPAForm";
import ServiceInfoForm from "../../components/Admission/ServiceInfoForm";
import PublicationsForm from "../../components/Admission/PublicationsForm";
import DocumentsUploadForm from "../../components/Admission/DocumentsUploadForm";
import Declaration from "../../components/Admission/Declaration";
import {
  validateDocuments
} from "../../helper/documentRules";


import {
  ApplyForAdmissionRequest,
  PublicAdmissionSeasonListRequest
} from "../../APIRequest/AdmissionAPIRequest";

import { DepartmentDropdownRequest } from "../../APIRequest/UserAPIRequest";
import axios from "axios";
import { BaseURL } from "../../helper/config";
import { ErrorToast } from "../../helper/FormHelper";

const STORAGE_KEY = "PGS_ADMISSION_FORM";
const MIN_CGPA = 2.75;

/* =================================================
   INITIAL FORM STATE
================================================= */
const initialFormState = {
  program: "",
  admissionSeason: "",
  academicYear: "",

  department: "",
  supervisor: "",

  applicantName: "",
  fatherName: "",
  motherName: "",
  dateOfBirth: "",
  nationality: "",
  maritalStatus: "",
  sex: "",

  email: "",
  mobile: "",

  presentAddress: {
    village: "",
    postOffice: "",
    postalCode: "",
    subDistrict: "",
    district: ""
  },

  permanentAddress: {
    village: "",
    postOffice: "",
    postalCode: "",
    subDistrict: "",
    district: ""
  },

  academicRecords: [],

  appliedSubjectCourses: [],
  calculatedCGPA: null,
  isEligibleByCGPA: true,

  isInService: false,
  serviceInfo: {},

  numberOfPublications: 0,
  publications: [],

  documents: [],
  totalDocumentSizeKB: 0,

  tempId: null,   // ✅ ADD THIS

  paymentTransactionId: "",
  declarationAccepted: false
};

const ApplyAdmissionPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormState);
  const [seasons, setSeasons] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  const [isPaid, setIsPaid] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  /* ================= LOAD SAVED FORM ================= */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsFormLoaded(true);
  }, []);

  /* ================= AUTO SAVE ================= */
  useEffect(() => {
    if (!isFormLoaded || isSubmitted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData, isFormLoaded, isSubmitted]);

  /* ================= PAYMENT RETURN (GATEWAY CALLBACK) ================= */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("paid") === "true") {
      setIsPaid(true);
      setFormData(prev => ({
        ...prev,
        paymentTransactionId:
          params.get("tran_id") || prev.paymentTransactionId
      }));

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    }
  }, []);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    (async () => setSeasons(await PublicAdmissionSeasonListRequest()))();
    (async () => setDepartments(await DepartmentDropdownRequest()))();
  }, []);

  /* ================= SET ACADEMIC YEAR ================= */
  useEffect(() => {
    const season = seasons.find(s => s._id === formData.admissionSeason);
    if (season) {
      setFormData(prev => ({
        ...prev,
        academicYear: season.academicYear
      }));
    }
  }, [formData.admissionSeason, seasons]);

  /* ================= LOAD SUPERVISORS ================= */
  useEffect(() => {
    if (!formData.department) {
      setSupervisors([]);
      return;
    }

    (async () => {
      try {
        const res = await axios.get(
          `${BaseURL}/users/supervisors/${formData.department}`
        );
        setSupervisors(
          res.data?.status === "success" ? res.data.data : []
        );
      } catch {
        setSupervisors([]);
      }
    })();
  }, [formData.department]);

  /* =================================================
     ✅ CHECK EXISTING PAYMENT (KEY FIX)
     email + season + program + SUCCESS
  ================================================= */
  useEffect(() => {
  if (!formData.email || !formData.admissionSeason || !formData.program) {
    setIsPaid(false);
    return;
  }

  (async () => {
    try {
      const res = await axios.post(
        `${BaseURL}/payment/check`,
        {
          email: formData.email,
          admissionSeason: formData.admissionSeason,
          program: formData.program
        }
      );

      if (
        res.data?.status === "success" &&
        res.data.data?.transactionId
      ) {
        setIsPaid(true);
        setFormData(prev => ({
          ...prev,
          paymentTransactionId: res.data.data.transactionId
        }));
      } else {
        setIsPaid(false);
      }
    } catch {
      setIsPaid(false);
    }
  })();
}, [formData.email, formData.admissionSeason, formData.program]);


  /* ================= PAYMENT ================= */
  const initiatePayment = async () => {
    if (!formData.email || !formData.admissionSeason || !formData.program) {
      return ErrorToast("Email, program and season required before payment");
    }

    try {
      setPaymentLoading(true);

      const res = await axios.post(
        `${BaseURL}/payment/initiate`,
        {
          email: formData.email,
          admissionSeason: formData.admissionSeason,
          program: formData.program
        }
      );

      if (res.data?.status === "success") {
        window.location.href = res.data.data;
      } else {
        ErrorToast("Payment initiation failed");
      }
    } catch {
      ErrorToast("Payment service unavailable");
    } finally {
      setPaymentLoading(false);
    }
  };

  /* ================= SUBMIT ================= */
 const submit = async () => {
  if (!isPaid) return ErrorToast("Please complete payment first");

  /* ================= DOCUMENT VALIDATION ================= */
  const docCheck = validateDocuments({
    program: formData.program,
    isInService: formData.isInService,
    documents: formData.documents
  });

  if (!docCheck.isValid) {
    return ErrorToast(
      `Missing required documents: ${docCheck.missing.join(", ")}`
    );
  }

  /* ================= CGPA CHECK ================= */
  if (
    ["MS", "MBA", "LLM"].includes(formData.program) &&
    formData.calculatedCGPA !== null &&
    formData.calculatedCGPA < MIN_CGPA
  ) {
    return ErrorToast(
      `Minimum required CGPA is ${MIN_CGPA}. You are not eligible to apply.`
    );
  }

  try {
    setIsSubmitting(true);

    const result = await ApplyForAdmissionRequest(formData);

    if (result?.status === "success") {
      setIsSubmitted(true);
      localStorage.removeItem(STORAGE_KEY);
      setFormData(initialFormState);
      setIsPaid(false);
      setIsSuccess(true);
      window.scrollTo(0, 0);
    }
  } finally {
    setIsSubmitting(false);
  }
};


  /* ================= UI ================= */
  return (
    <div className="admission-page">
    <div className="admission-card">
      <div className="admission-header text-center">
        <h2 className="fw-bolder text-dark">
          Postgraduate Admission Application
        </h2>
        <p className="text-muted mb-0">
          Patuakhali Science and Technology University
        </p>

        <button
          className="btn btn-outline-danger btn-sm position-absolute end-0 top-0"
          onClick={() => navigate("/")}
        >
          Exit
        </button>
      </div>

      {!isSuccess ? (
        <>
          <ProgramSelector formData={formData} setFormData={setFormData} />
          <SeasonSelector formData={formData} setFormData={setFormData} seasons={seasons} />
          <DepartmentSupervisorSelector
            formData={formData}
            setFormData={setFormData}
            departments={departments}
            supervisors={supervisors}
          />
          <PersonalInfoForm formData={formData} setFormData={setFormData} />
          <AddressForm formData={formData} setFormData={setFormData} />
          <AcademicInfoForm formData={formData} setFormData={setFormData} />
          <AppliedSubjectGPAForm formData={formData} setFormData={setFormData} />
          <ServiceInfoForm formData={formData} setFormData={setFormData} />
          <PublicationsForm formData={formData} setFormData={setFormData} />
          <DocumentsUploadForm
  formData={formData}
  setFormData={setFormData}
/>

          <Declaration formData={formData} setFormData={setFormData} />

          {!isPaid ? (
            <button
              className="btn btn-warning w-100 mt-4"
              onClick={initiatePayment}
              disabled={paymentLoading}
            >
              {paymentLoading ? "Redirecting..." : "Pay Application Fee (৳100)"}
            </button>
          ) : (
            <div className="alert alert-info mt-3 text-center">
              ✅ Application fee already paid. You can submit anytime.
            </div>
          )}

          <button
            className="btn btn-success w-100 mt-3"
            onClick={submit}
            disabled={!isPaid || isSubmitting || formData.isEligibleByCGPA === false}
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </button>
        </>
      ) : (
        <div className="card shadow-lg p-5 text-center">
          <h2 className="text-success fw-bold">Submission Successful!</h2>
          <p className="text-muted">
            A confirmation email with PDF has been sent to your email.
          </p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate("/", { replace: true })}
          >
            Return to Home
          </button>
        </div>
      )}
    </div>
    </div>
  );
};

export default ApplyAdmissionPage;
