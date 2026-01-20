import { useEffect, useState } from "react";
import ProgramSelector from "../../components/Admission/ProgramSelector";
import SeasonSelector from "../../components/Admission/SeasonSelector";
import DepartmentSupervisorSelector from "../../components/Admission/DepartmentSupervisorSelector";
import PersonalInfoForm from "../../components/Admission/PersonalInfoForm";
import AddressForm from "../../components/Admission/AddressForm";
import AcademicInfoForm from "../../components/Admission/AcademicInfoForm";
import ServiceInfoForm from "../../components/Admission/ServiceInfoForm";
import PublicationsForm from "../../components/Admission/PublicationsForm";
import Declaration from "../../components/Admission/Declaration";

import {
  ApplyForAdmissionRequest,
  PublicAdmissionSeasonListRequest
} from "../../APIRequest/AdmissionAPIRequest";

import { DepartmentDropdownRequest } from "../../APIRequest/UserAPIRequest";
import axios from "axios";
import { BaseURL } from "../../helper/config";
import { ErrorToast } from "../../helper/FormHelper";

const ApplyAdmissionPage = () => {

  // ================= STATE =================
  const [seasons, setSeasons] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

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
  pstuLastSemesterCourses: [],

  isInService: false,
  serviceInfo: {},

   numberOfPublications: 0,
  publications: [],

  declarationAccepted: false
});


  // ================= LOAD ADMISSION SEASONS (PUBLIC) =================
  useEffect(() => {
    (async () => {
      const data = await PublicAdmissionSeasonListRequest();
      setSeasons(data);
    })();
  }, []);

  // ================= LOAD DEPARTMENTS =================
  useEffect(() => {
    (async () => {
      const data = await DepartmentDropdownRequest();
      setDepartments(data);
    })();
  }, []);

  // ================= LOAD SUPERVISORS BY DEPARTMENT =================
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

        if (res.data?.status === "success") {
          setSupervisors(res.data.data);
        } else {
          setSupervisors([]);
        }
      } catch {
        setSupervisors([]);
      }
    })();
  }, [formData.department]);

  // ================= SUBMIT =================
  const submit = async () => {

    if (!formData.declarationAccepted) {
      ErrorToast("You must accept the declaration");
      return;
    }

    const success = await ApplyForAdmissionRequest(formData);
    if (success) {
      // optional reset
    }
  };

  // ================= UI =================
  return (
    <div className="container mt-4 mb-5">
      <h2 className="text-center mb-4">
        Postgraduate Admission Application
      </h2>

      {/* STEP 1 */}
      <ProgramSelector
        formData={formData}
        setFormData={setFormData}
      />

      {/* STEP 2 */}
      <SeasonSelector
        formData={formData}
        setFormData={setFormData}
        seasons={seasons}
      />

      {/* STEP 3 */}
      <DepartmentSupervisorSelector
        formData={formData}
        setFormData={setFormData}
        departments={departments}
        supervisors={supervisors}
      />

      {/* STEP 4 */}
      <PersonalInfoForm
        formData={formData}
        setFormData={setFormData}
      />

      {/* STEP 5 */}
      <AddressForm
        formData={formData}
        setFormData={setFormData}
      />

      {/* STEP 6 */}
      <AcademicInfoForm
        formData={formData}
        setFormData={setFormData}
      />

      {/* STEP 7 */}
      <ServiceInfoForm
        formData={formData}
        setFormData={setFormData}
      />

      <PublicationsForm
  formData={formData}
  setFormData={setFormData}
/>

      {/* STEP 8 */}
      <Declaration
        formData={formData}
        setFormData={setFormData}
      />

      <button
        className="btn btn-success w-100 mt-4"
        onClick={submit}
      >
        Submit Application
      </button>
    </div>
  );
};

export default ApplyAdmissionPage;
