import { useEffect, useState } from "react";
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
import { ErrorToast } from "../../helper/FormHelper";

const STORAGE_KEY = "PGS_ADMISSION_FORM";

const ApplyAdmissionPage = () => {

  /* ================= STATE ================= */
  const [seasons, setSeasons] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  const [isPaid, setIsPaid] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // 🔐 CRITICAL FLAG
  const [isFormLoaded, setIsFormLoaded] = useState(false);

  const [formData, setFormData] = useState({
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
    pstuBScInfo: {
      registrationNo: "",
      session: ""
    },
    pstuLastSemesterCourses: [],

    isInService: false,
    serviceInfo: {},

    numberOfPublications: 0,
    publications: [],

    documents: [],
    totalDocumentSizeKB: 0,

    paymentTransactionId: "",
    declarationAccepted: false
  });

  /* ================= LOAD SAVED FORM (FIRST) ================= */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // ✅ allow autosave ONLY after load
    setIsFormLoaded(true);
  }, []);

  /* ================= AUTO SAVE (SAFE) ================= */
  useEffect(() => {
    if (!isFormLoaded) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(formData)
    );
  }, [formData, isFormLoaded]);

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
    }
  }, []);

  /* ================= LOAD SEASONS ================= */
  useEffect(() => {
    (async () => {
      setSeasons(await PublicAdmissionSeasonListRequest());
    })();
  }, []);

  /* ================= LOAD DEPARTMENTS ================= */
  useEffect(() => {
    (async () => {
      setDepartments(await DepartmentDropdownRequest());
    })();
  }, []);

  /* ================= SET ACADEMIC YEAR ================= */
  useEffect(() => {
    const season = seasons.find(
      s => s._id === formData.admissionSeason
    );

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
          res.data?.status === "success"
            ? res.data.data
            : []
        );
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
    if (!isPaid || !formData.paymentTransactionId) {
      ErrorToast("Payment not verified");
      return;
    }

    if (!formData.declarationAccepted) {
      ErrorToast("You must accept the declaration");
      return;
    }

    if (
      !formData.documents.length ||
      formData.totalDocumentSizeKB > 30720
    ) {
      ErrorToast("Upload required documents (max 30MB)");
      return;
    }

    await ApplyForAdmissionRequest(formData);

    // ✅ clear draft ONLY after success
    localStorage.removeItem(STORAGE_KEY);
  };

  /* ================= UI ================= */
  return (
    <div className="container mt-4 mb-5">
      <h2 className="text-center mb-4">
        Postgraduate Admission Application
      </h2>

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

      {!isPaid && (
        <button
          className="btn btn-warning w-100 mt-4"
          onClick={initiatePayment}
          disabled={paymentLoading}
        >
          {paymentLoading
            ? "Redirecting to Payment Gateway..."
            : "Pay Application Fee (৳100)"}
        </button>
      )}

      <button
        className="btn btn-success w-100 mt-3"
        onClick={submit}
        disabled={!isPaid || paymentLoading}
      >
        Submit Application
      </button>

      {isPaid && (
        <div className="alert alert-success mt-3 text-center">
          ✅ Application fee paid successfully
        </div>
      )}
    </div>
  );
};

export default ApplyAdmissionPage;
