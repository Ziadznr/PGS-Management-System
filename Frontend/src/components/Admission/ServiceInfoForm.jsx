const ServiceInfoForm = ({ formData, setFormData }) => {
  const { isInService, serviceInfo = {} } = formData;

  const updateServiceInfo = (field, value) => {
    setFormData(prev => ({
      ...prev,
      serviceInfo: {
        ...prev.serviceInfo,
        [field]: value
      }
    }));
  };

  const handleServiceToggle = (value) => {
    setFormData(prev => ({
      ...prev,
      isInService: value,
      serviceInfo: value
        ? {
            position: "",
            lengthOfService: "",
            natureOfJob: "",
            employer: ""
          }
        : {}
    }));
  };

  return (
    <div className="card p-3 mt-3">
      <h5>10. In-Service Information</h5>

      {/* YES / NO */}
      <div className="d-flex gap-4 mb-3">
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="isInService"
            checked={isInService === true}
            onChange={() => handleServiceToggle(true)}
          />
          <label className="form-check-label">
            Yes
          </label>
        </div>

        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="isInService"
            checked={isInService === false}
            onChange={() => handleServiceToggle(false)}
          />
          <label className="form-check-label">
            No
          </label>
        </div>
      </div>

      {/* SERVICE DETAILS */}
      {isInService && (
        <>
          <div className="mb-2">
            <label className="form-label">
              a. Present Position
            </label>
            <input
              className="form-control"
              value={serviceInfo.position || ""}
              onChange={e =>
                updateServiceInfo("position", e.target.value)
              }
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label">
              b. Length of Service
            </label>
            <input
              className="form-control"
              placeholder="e.g. 5 years 3 months"
              value={serviceInfo.lengthOfService || ""}
              onChange={e =>
                updateServiceInfo(
                  "lengthOfService",
                  e.target.value
                )
              }
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label">
              c. Nature of Job
            </label>
            <input
              className="form-control"
              value={serviceInfo.natureOfJob || ""}
              onChange={e =>
                updateServiceInfo(
                  "natureOfJob",
                  e.target.value
                )
              }
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label">
              d. Employer
            </label>
            <input
              className="form-control"
              value={serviceInfo.employer || ""}
              onChange={e =>
                updateServiceInfo("employer", e.target.value)
              }
              required
            />
          </div>

          {/* NOTICE */}
          <div className="alert alert-warning mt-3">
            <strong>Note:</strong> In-service candidates must
            enclose a letter from their employer stating that
            they will be allowed deputation/leave for at least
            <strong> 18 months (MS/MBA)</strong> or
            <strong> 36 months (PhD)</strong>.
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceInfoForm;
