import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { FacultyListRequest, DeleteFacultyRequest } from "../../APIRequest/FacultyAPIRequest";
import { Link } from "react-router-dom";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import moment from "moment";
import { DeleteAlert } from "../../helper/DeleteAlert";

const FacultyList = () => {

  const DataList = useSelector((state) => state.faculty.List || []);

  // ================= LOAD FACULTIES =================
  useEffect(() => {
    // Load all faculties (large perPage to avoid pagination)
    FacultyListRequest(1, 1000, "0");
  }, []);

  // ================= DELETE =================
  const DeleteItem = async (id) => {
    const confirm = await DeleteAlert();
    if (!confirm.isConfirmed) return;

    const success = await DeleteFacultyRequest(id);
    if (success) {
      FacultyListRequest(1, 1000, "0");
    }
  };

  // ================= UI =================
  return (
    <div className="container-fluid my-5">
      <div className="row">
        <div className="col-12">

          <div className="card">
            <div className="card-body">

              <h5>Faculty List</h5>
              <hr />

              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Faculty Name</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {DataList.length > 0 ? (
                      DataList.map((item, index) => (
                        <tr key={item._id}>
                          <td>{index + 1}</td>

                          <td>{item.name}</td>

                          <td>
                            {moment(item.createdAt).format("MMMM Do YYYY")}
                          </td>

                          <td>
                            <Link
                              to={`/FacultyCreatePage?id=${item._id}`}
                              className="btn btn-sm btn-outline-primary me-2"
                            >
                              <AiOutlineEdit size={16} />
                            </Link>

                            <button
                              disabled={DataList.length <= 1}
                              onClick={() => DeleteItem(item._id)}
                              className="btn btn-sm btn-outline-danger"
                              title={
                                DataList.length <= 1
                                  ? "At least one faculty must exist"
                                  : "Delete Faculty"
                              }
                            >
                              <AiOutlineDelete size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">
                          No Faculty Found
                        </td>
                      </tr>
                    )}
                  </tbody>

                </table>
              </div>

              <p className="text-muted mt-3">
                ⚠ At least one faculty must exist in the system.
              </p>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FacultyList;
