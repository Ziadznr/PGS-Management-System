import React, { Fragment, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";

import {
  HallListRequest,
  DeleteHallRequest
} from "../../APIRequest/HallAPIRequest";

import { DeleteAlert } from "../../helper/DeleteAlert";

const HallList = () => {
  const DataList = useSelector(state => state.hall.List);

  /* ================= LOAD ================= */
  useEffect(() => {
    HallListRequest();
  }, []);

  /* ================= DELETE ================= */
  const DeleteItem = async (id) => {
    const result = await DeleteAlert(
      "Delete Hall?",
      "Provost assignment (if any) will be removed."
    );

    if (result.isConfirmed) {
      const ok = await DeleteHallRequest(id);
      if (ok) {
        HallListRequest();
      }
    }
  };

  /* ================= UI ================= */
  return (
    <Fragment>
      <div className="container-fluid my-5">
        <div className="card shadow-sm">
          <div className="card-body">

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-0">Hall List</h5>
                <small className="text-muted">
                  Manage residential halls
                </small>
              </div>

              <Link
                to="/HallCreateUpdatePage"
                className="btn btn-sm btn-success"
              >
                + Create Hall
              </Link>
            </div>

            {/* TABLE */}
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Hall Name</th>
                  <th>Code</th>
                  <th>Created</th>
                  <th style={{ width: "140px" }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {DataList?.length ? (
                  DataList.map((hall, i) => (
                    <tr key={hall._id}>
                      <td>{i + 1}</td>

                      <td className="fw-medium">
                        {hall.name}
                      </td>

                      <td>
                        <span className="badge bg-secondary">
                          {hall.code}
                        </span>
                      </td>

                      <td>
                        {new Date(hall.createdAt).toLocaleDateString()}
                      </td>

                      <td>
                        <Link
                          to={`/HallCreateUpdatePage?id=${hall._id}`}
                          className="btn btn-sm btn-outline-info me-2"
                        >
                          <AiOutlineEdit />
                        </Link>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => DeleteItem(hall._id)}
                        >
                          <AiOutlineDelete />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">
                      No halls found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default HallList;
