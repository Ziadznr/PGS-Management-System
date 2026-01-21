import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProgramSelector from "../../components/Admission/ProgramSelector";
import SeasonSelector from "../../components/Admission/SeasonSelector";
import DepartmentSupervisorSelector from "../../components/Admission/DepartmentSupervisorSelector";
import PersonalInfoForm from "../../components/Admission/PersonalInfoForm";
import AddressForm from "../../components/Admission/AddressForm";
import AcademicInfoForm from "../../components/Admission/AcademicInfoForm";
import ServiceInfoForm from "../../components/Admission/ServiceInfoForm";
import PublicationsForm from "../../components/Admission/PublicationsForm";
import DocumentsUploadForm from "../../components/Admission/DocumentsUploadForm";
import Declaration from "../../components/Admission/Declaration";

import {
  ApplyForAdmissionRequest,
  PublicAdmissionSeasonListRequest
} from "../../APIRequest/AdmissionAPIRequest";

import { DepartmentDropdownRequest } from "../../APIRequest/UserAPIRequest";
import axios from "axios";
import { BaseURL } from "../../helper/config";
import { ErrorToast, SuccessToast } from "../../helper/FormHelper";

const STORAGE_KEY = "PGS_ADMISSION_FORM";




const ApplyAdmissionPage = () => {

  /* ================= STATE ================= */
  const navigate = useNavigate();

  const [seasons, setSeasons] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔐 critical autosave guard
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
  isPSTUStudent: false,
  pstuBScInfo: { registrationNo: "", session: "" },
  pstuLastSemesterCourses: [],

  isInService: false,
  serviceInfo: {},

  numberOfPublications: 0,
  publications: [],

  documents: [],
  totalDocumentSizeKB: 0,

  paymentTransactionId: "",
  declarationAccepted: false
};
const [formData, setFormData] = useState(initialFormState);

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

  /* ================= AUTO SAVE (SAFE) ================= */
  useEffect(() => {
    if (!isFormLoaded || isSubmitted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData, isFormLoaded, isSubmitted]);

  /* ================= PAYMENT RETURN ================= */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("paid") === "true") {
      setIsPaid(true);

      setFormData(prev => ({
        ...prev,
        paymentTransactionId:
          params.get("tran_id") || prev.paymentTransactionId
      }));

      // ✅ clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
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
      setFormData(prev => ({ ...prev, academicYear: season.academicYear }));
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
        setSupervisors(res.data?.status === "success" ? res.data.data : []);
      } catch {
        setSupervisors([]);
      }
    })();
  }, [formData.department]);

  /* ================= PAYMENT ================= */
  const initiatePayment = async () => {
    if (!formData.email || !formData.admissionSeason) {
      ErrorToast("Email and admission season required before payment");
      return;
    }

    try {
      setPaymentLoading(true);

      const res = await axios.post(
        `${BaseURL}/payment/initiate`,
        {
          email: formData.email,
          admissionSeason: formData.admissionSeason
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

  try {
    setIsSubmitting(true);
    
    // The API helper already handles the Toast and the logic
    const result = await ApplyForAdmissionRequest(formData);

    // If result is not false, it means it was a success
    if (result) {
      setIsSubmitted(true); 
      localStorage.removeItem(STORAGE_KEY);
      setFormData(initialFormState);
      setIsPaid(false);
      setIsSuccess(true); // This will now trigger your "Go Home" button
      window.scrollTo(0, 0); 
    }
  } catch (err) {
    console.error("Submission Error:", err);
  } finally {
    setIsSubmitting(false);
  }
};



  /* ================= UI ================= */
return (
  <div className="container mt-4 mb-5">
    <h2 className="text-center mb-4">
      Postgraduate Admission Application
    </h2>

    {/* IF NOT SUCCESS: Show the entire form and action buttons
       IF SUCCESS: Hide everything and show only the success confirmation
    */}
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
        <ServiceInfoForm formData={formData} setFormData={setFormData} />
        <PublicationsForm formData={formData} setFormData={setFormData} />
        <DocumentsUploadForm formData={formData} setFormData={setFormData} />
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
            ✅ Application fee paid. You can now submit.
          </div>
        )}

        <button
          className="btn btn-success w-100 mt-3"
          onClick={submit}
          disabled={!isPaid || isSubmitting}
        >
          {isSubmitting ? "Submitting Application..." : "Submit Application"}
        </button>
      </>
    ) : (
      /* SUCCESS VIEW - This is all the user will see after submitting */
      <div className="card border-0 shadow-lg p-5 mt-5 text-center">
        <div className="card-body">
          <div className="mb-4">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "4rem" }}>✅</i>
          </div>
          <h2 className="fw-bold text-success">Submission Successful!</h2>
          <p className="text-muted mb-4">
            Your application has been received successfully. 
            A confirmation email with your application PDF has been sent to <strong>{formData.email}</strong>.
          </p>
          <hr />
          <button
            className="btn btn-primary btn-lg w-100 mt-3"
            onClick={() => {
                // Navigate home and clear any remaining state
                navigate("/", { replace: true });
            }}
          >
            Return to Home Page
          </button>
        </div>
      </div>
    )}
  </div>
);
};

export default ApplyAdmissionPage;
