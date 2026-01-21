import React from "react";
import { Link } from "react-router-dom";

const ApplicationSuccessPage = () => {
  return (
    <div className="container mt-5 text-center">
      <h2 className="text-success mb-3">
        🎉 Application Submitted Successfully
      </h2>

      <p>
        Your postgraduate admission application has been submitted.
        Please check your email for confirmation and further instructions.
      </p>

      <Link to="/" className="btn btn-primary mt-3">
        Go to Home
      </Link>
    </div>
  );
};

export default ApplicationSuccessPage;
