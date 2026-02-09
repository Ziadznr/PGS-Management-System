import { useEffect, useState } from "react";
import { DepartmentDropdownByProgramRequest } from "../../APIRequest/DepartmentAPIRequest";
import DepartmentSupervisorSelector from "./DepartmentSupervisorSelector";

const ProgramDepartmentWrapper = ({ formData, setFormData }) => {
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  useEffect(() => {
    if (!formData.program) {
      setDepartments([]);
      return;
    }

    setLoadingDepartments(true);

    DepartmentDropdownByProgramRequest(formData.program)
      .then(data => setDepartments(data || []))
      .finally(() => setLoadingDepartments(false));

  }, [formData.program]);

  return (
    <DepartmentSupervisorSelector
      formData={formData}
      setFormData={setFormData}
      departments={departments}
      loadingDepartments={loadingDepartments}
    />
  );
};

export default ProgramDepartmentWrapper;
