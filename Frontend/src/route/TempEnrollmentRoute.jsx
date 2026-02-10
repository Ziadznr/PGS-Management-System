import { Navigate, useParams } from "react-router-dom";
import { getTempEnrollment } from "../helper/SessionHelper";

const TempEnrollmentRoute = ({ children }) => {
  const { applicationId } = useParams();
  const tempData = getTempEnrollment();

  if (!tempData) {
    return <Navigate to="/admission/temporary-login" replace />;
  }

  if (String(tempData.applicationId) !== String(applicationId)) {
    return <Navigate to="/admission/temporary-login" replace />;
  }

  if (Date.parse(tempData.enrollmentDeadline) < Date.now()) {
    return <Navigate to="/admission/temporary-login" replace />;
  }

  return children;
};

export default TempEnrollmentRoute;
