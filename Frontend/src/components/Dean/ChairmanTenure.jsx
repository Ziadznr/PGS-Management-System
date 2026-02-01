import React, { useEffect, useState } from "react";
import { DeanChairmanTenureListRequest } from "../../APIRequest/UserAPIRequest";

const ChairmanTenure = () => {
  const [tenures, setTenures] = useState([]);

  useEffect(() => {
    DeanChairmanTenureListRequest().then(setTenures);
  }, []);

  return (
    <div className="container mt-4">
      <h4>🏛 Chairman Tenure History</h4>

      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Chairman</th>
            <th>Department</th>
            <th>Start Date</th>
            <th>End Date</th>
          </tr>
        </thead>

        <tbody>
          {tenures.map((t, i) => (
            <tr key={t._id}>
              <td>{i + 1}</td>
              <td>{t.user?.name}</td>
              <td>{t.department?.name}</td>
              <td>{new Date(t.startDate).toDateString()}</td>
              <td>
                {t.endDate
                  ? new Date(t.endDate).toDateString()
                  : <span className="badge bg-success">Current</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChairmanTenure;
