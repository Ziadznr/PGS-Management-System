import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  AdminUsersListRequest,
  AdminDeleteUserRequest,
  AdminSendEmailRequest
} from "../../APIRequest/UserAPIRequest";
import {
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineMail
} from "react-icons/ai";
import ReactPaginate from "react-paginate";
import { DeleteAlert } from "../../helper/DeleteAlert";
import { ErrorToast, SuccessToast } from "../../helper/FormHelper";
import "../../assets/css/EmailModal.css";

const AdminUsersList = () => {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [searchKeyword, setSearchKeyword] = useState("");
  const [role, setRole] = useState("All");
  const [perPage, setPerPage] = useState(20);
  const [pageNo, setPageNo] = useState(1);
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  /* ================= EMAIL MODAL ================= */
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const searchTimeout = useRef(null);

  /* ================= FETCH USERS ================= */
  const fetchUsers = async (page = 1, keyword = searchKeyword) => {
    try {
      setLoading(true);
      setPageNo(page);

      const result = await AdminUsersListRequest(
        page,
        perPage,
        keyword || "0",
        role
      );

      setUsers(result?.Rows || []);
      setTotalCount(result?.Total?.[0]?.count || 0);

    } catch (error) {
      console.error(error);
      ErrorToast("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchUsers(1);
  }, [perPage, role]);

  /* ================= DEBOUNCED SEARCH ================= */
  useEffect(() => {
    clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      fetchUsers(1, searchKeyword);
    }, 500);

    return () => clearTimeout(searchTimeout.current);
  }, [searchKeyword]);

  /* ================= PAGINATION ================= */
  const handlePageClick = (event) => {
    fetchUsers(event.selected + 1);
  };

  /* ================= DELETE USER ================= */
  const DeleteItem = async (id) => {
    const confirm = await DeleteAlert();
    if (!confirm) return;

    const result = await AdminDeleteUserRequest(id);
    if (result) {
      SuccessToast("User deleted successfully");

      const newPage =
        users.length === 1 && pageNo > 1 ? pageNo - 1 : pageNo;

      fetchUsers(newPage);
    }
  };

  /* ================= SEND EMAIL ================= */
  const SendEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      ErrorToast("Subject & message required");
      return;
    }

    if (emailSending) return;

    setEmailSending(true);

    const result = await AdminSendEmailRequest(
      selectedUserId,
      emailSubject,
      emailMessage,
      attachments
    );

    setEmailSending(false);

    if (result) {
      SuccessToast("Email sent successfully");
      closeEmailModal();
    }
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    setSelectedUserId(null);
    setEmailSubject("");
    setEmailMessage("");
    setAttachments([]);
  };

  /* ================= UI ================= */
  return (
    <div className="container-fluid my-4">

      {/* ================= FILTERS ================= */}
      <div className="row mb-3 align-items-center">
        <div className="col-3">
          <h5>Users List</h5>
        </div>

        <div className="col-3">
          <input
            className="form-control form-control-sm"
            placeholder="Search name / email"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>

        <div className="col-3">
          <select
            className="form-select form-select-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Dean">Dean</option>
            <option value="VC">VC</option>
            <option value="Registrar">Registrar</option>
            <option value="PGS Specialist">PGS Specialist</option>
            <option value="Provost">Provost</option>
            <option value="Chairman">Chairman</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Student">Student</option>
          </select>
        </div>

        <div className="col-3">
          <select
            className="form-select form-select-sm"
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
          >
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>No</th>
              <th>Photo</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Department / Hall</th>
              <th>Edit</th>
              <th>Delete</th>
              <th>Mail</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center">
                  Loading...
                </td>
              </tr>
            ) : users.length ? (
              users.map((u, i) => (
                <tr key={u._id}>
                  <td>{i + 1 + (pageNo - 1) * perPage}</td>
<td className="text-center">
 <img
  src={u.photo || "/default-user.png"}
  alt="user"
  onClick={() => setPreviewPhoto(u.photo)}
  style={{
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    objectFit: "cover",
    cursor: "pointer",
    transition: "0.2s"
  }}
/>
</td>
                  <td>
                    <strong>{u.name}</strong>
                    <div className="text-muted small ps-2">
                      {u.nameExtension}
                    </div>

                    {u.role === "Supervisor" && u.subject && (
                      <div className="text-muted small">
                        Subject: {u.subject}
                      </div>
                    )}
                  </td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>{u.role}</td>

                  <td>
                    {u.DepartmentName ||
                      u.HallName ||
                      "-"}
                  </td>

                  <td>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() =>
                        navigate("/AdminCreateUserPage", {
                          state: { user: u }
                        })
                      }
                    >
                      <AiOutlineEdit />
                    </button>
                  </td>

                  <td>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => DeleteItem(u._id)}
                    >
                      <AiOutlineDelete />
                    </button>
                  </td>

                  <td>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => {
                        setSelectedUserId(u._id);
                        setEmailSubject(`Hello ${u.name}`);
                        setShowEmailModal(true);
                      }}
                    >
                      <AiOutlineMail />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center text-muted">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= PAGINATION ================= */}
      {totalCount > perPage && (
        <ReactPaginate
          previousLabel="<"
          nextLabel=">"
          pageCount={Math.ceil(totalCount / perPage)}
          onPageChange={handlePageClick}
          containerClassName="pagination"
          activeClassName="active"
        />
      )}

      {/* ================= EMAIL MODAL ================= */}
      {showEmailModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-content-custom">
            <h5>Send Email</h5>

            <input
              className="form-control mb-2"
              placeholder="Subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />

            <textarea
              className="form-control mb-2"
              rows={4}
              placeholder="Message"
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
            />

            <input
              type="file"
              multiple
              className="form-control mb-2"
              onChange={(e) => setAttachments([...e.target.files])}
            />

            <div className="text-end">
              <button
                className="btn btn-secondary btn-sm me-2"
                onClick={closeEmailModal}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary btn-sm"
                disabled={emailSending}
                onClick={SendEmail}
              >
                {emailSending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PHOTO PREVIEW ================= */}
{previewPhoto && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    }}
    onClick={() => setPreviewPhoto(null)}
  >
    <img
      src={previewPhoto}
      alt="preview"
      style={{
        maxWidth: "500px",
        maxHeight: "80vh",
        borderRadius: "10px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
      }}
      onClick={(e) => e.stopPropagation()}
    />
  </div>
)}


    </div>
  );
};

export default AdminUsersList;
