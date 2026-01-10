import React from "react";
import { useSelector } from "react-redux";

import StudentDashboard from "./StudentDashboard";
import SupervisorDashboard from "./SupervisorDashboard";
import ChairmanDashboard from "./ChairmanDashboard";
import DeanDashboard from "./DeanDashboard";

const DashboardRouter = () => {
  const role = useSelector((state) => state.userProfile.user.role);

  switch (role) {
    case "Supervisor":
      return <SupervisorDashboard />;

    case "Chairman":
      return <ChairmanDashboard />;

    case "Dean":
      return <DeanDashboard />;

    case "Student":
    default:
      return <StudentDashboard />;
  }
};

export default DashboardRouter;
