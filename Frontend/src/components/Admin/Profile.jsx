import React, { useEffect, useState } from "react";
import { GetProfileDetails, ProfileUpdateRequest } from "../../APIRequest/AdminAPIRequest";
import { useSelector } from "react-redux";
import { ErrorToast, getBase64, IsEmpty, IsMobile } from "../../helper/FormHelper";
import { useNavigate } from "react-router-dom";

const DEFAULT_PHOTO = "/defaultPhoto.png";

const Profile = () => {
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    mobile: "",
    photo: ""
  });

  const navigate = useNavigate();
  const profile = useSelector((state) => state.profile.value);

  // load profile
  useEffect(() => {
    (async () => {
      setLoading(true);
      await GetProfileDetails();
      setLoading(false);
    })();
  }, []);

  // sync redux → local form
  useEffect(() => {
    if (profile?.email) {
      setForm({
        email: profile.email || "",
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        mobile: profile.mobile || "",
        photo: profile.photo || ""
      });
    }
  }, [profile]);

  // preview image
  const PreviewImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64 = await getBase64(file);
    setForm((prev) => ({ ...prev, photo: base64 }));
  };

  // update profile
  const UpdateMyProfile = async () => {
    const { firstName, lastName, mobile, photo } = form;

    if (IsEmpty(firstName)) {
      ErrorToast("First Name Required !");
    } else if (IsEmpty(lastName)) {
      ErrorToast("Last Name Required !");
    } else if (!IsMobile(mobile)) {
      ErrorToast("Valid Mobile Required !");
    } else {
      const result = await ProfileUpdateRequest(
        firstName,
        lastName,
        mobile,
        photo
      );

      if (result) navigate("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "70vh" }}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">

              <img
                src={
                  form.photo?.startsWith("data:image")
                    ? form.photo
                    : DEFAULT_PHOTO
                }
                className="icon-nav-img-lg mb-3"
                alt="Profile"
              />

              <hr />

              <div className="row">

                <div className="col-md-4 p-2">
                  <label>Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={PreviewImage}
                    className="form-control"
                  />
                </div>

                <div className="col-md-4 p-2">
                  <label>Email Address</label>
                  <input value={form.email} readOnly className="form-control" />
                </div>

                <div className="col-md-4 p-2">
                  <label>First Name</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="col-md-4 p-2">
                  <label>Last Name</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="col-md-4 p-2">
                  <label>Mobile</label>
                  <input
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="col-md-4 p-2 d-flex align-items-end">
                  <button onClick={UpdateMyProfile} className="btn btn-success w-100">
                    Update Profile
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
