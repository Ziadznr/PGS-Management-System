// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import store from "../../redux/store/store";
// import { OnChangeCustomerInput } from "../../redux/state-slice/customer-slice";
// import {
//   CreateCustomerRequest,
//   FillCustomerFormRequest,
// } from "../../APIRequest/CustomerAPIRequest";
// import {
//   ErrorToast,
//   IsEmail,
//   IsEmpty,
//   SuccessToast,
// } from "../../helper/FormHelper";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { BaseURL } from "../../helper/config";
// import { getToken } from "../../helper/SessionHelper";

// const CustomerCreateUpdate = () => {
//   const FormValue = useSelector((state) => state.customer.FormValue);
//   const navigate = useNavigate();
//   const [ObjectID, SetObjectID] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const [faculties, setFaculties] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [sections, setSections] = useState([]);

//   const AxiosHeader = { headers: { token: getToken() } };

//   // ---------------- Initial Load ----------------
//   useEffect(() => {
//     const init = async () => {
//       try {
//         const id = new URLSearchParams(window.location.search).get("id");
//         await fetchDropdowns();

//         if (id) {
//           SetObjectID(id);
//           const success = await FillCustomerFormRequest(id);
//           // Preload departments if faculty exists in edit mode
//           if (success && FormValue.Faculty) {
//             await fetchDepartments(FormValue.Faculty);
//           }
//         }
//       } catch (error) {
//         console.log("Init error:", error);
//       }
//     };
//     init();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---------------- Fetch Faculty + Section ----------------
//   const fetchDropdowns = async () => {
//     try {
//       const facRes = await axios.get(`${BaseURL}/FacultyDropdown`, AxiosHeader);
//       setFaculties(facRes.data?.data || []);

//       const secRes = await axios.get(`${BaseURL}/SectionDropdown`, AxiosHeader);
//       setSections(secRes.data?.data || []);
//     } catch (error) {
//       console.log("Dropdown fetch error:", error);
//       ErrorToast("Failed to fetch dropdowns");
//     }
//   };

//   // ---------------- Fetch Department By Faculty ----------------
//   const fetchDepartments = async (facultyID) => {
//     try {
//       if (!facultyID) return setDepartments([]); // Reset if no faculty selected
//       const deptRes = await axios.get(
//         `${BaseURL}/DepartmentDropdown/${facultyID}`,
//         AxiosHeader
//       );
//       setDepartments(deptRes.data?.data || []);
//     } catch (error) {
//       console.log("Department fetch error:", error);
//       ErrorToast("Failed to fetch departments");
//     }
//   };

//   // ---------------- Handle Input Change ----------------
//   const handleInputChange = (name, value) => {
//     store.dispatch(OnChangeCustomerInput({ Name: name, Value: value }));

//     if (name === "Faculty") {
//       // Reset department when faculty changes
//       store.dispatch(OnChangeCustomerInput({ Name: "Department", Value: "" }));
//       fetchDepartments(value);
//     }
//   };

//   // ---------------- Save Change ----------------
//   const SaveChange = async () => {
//     if (IsEmpty(FormValue.CustomerName))
//       return ErrorToast("Customer Name Required!");
//     if (IsEmpty(FormValue.Phone))
//       return ErrorToast("Customer Phone Required!");
//     if (!IsEmail(FormValue.CustomerEmail))
//       return ErrorToast("Valid Email Required!"); // ✅ updated

//     if (FormValue.Category === "Dean" && IsEmpty(FormValue.Faculty))
//       return ErrorToast("Faculty Required for Dean!");
//     if (
//       (FormValue.Category === "Teacher" ||
//         FormValue.Category === "Chairman") &&
//       (IsEmpty(FormValue.Faculty) || IsEmpty(FormValue.Department))
//     )
//       return ErrorToast("Faculty and Department Required!");
//     if (FormValue.Category === "Officer" && IsEmpty(FormValue.Section))
//       return ErrorToast("Section Required for Officer!");

//     setLoading(true);
//     const success = await CreateCustomerRequest(FormValue, ObjectID);
//     setLoading(false);

//     if (success) {
//       SuccessToast("Customer saved successfully!");
//       navigate("/CustomerListPage");
//     }
//   };

//   return (
//     <div className="container-fluid">
//       <div className="row">
//         <div className="col-12">
//           <div className="card">
//             <div className="card-body">
//               <h5>{ObjectID ? "Update Customer" : "Create Customer"}</h5>
//               <hr className="bg-light" />

//               <div className="row">
//                 {/* Customer Name */}
//                 <div className="col-4 p-2">
//                   <label className="form-label">Customer Name</label>
//                   <input
//                     type="text"
//                     className="form-control form-control-sm"
//                     value={FormValue.CustomerName}
//                     onChange={(e) =>
//                       handleInputChange("CustomerName", e.target.value)
//                     }
//                   />
//                 </div>

//                 {/* Phone */}
//                 <div className="col-4 p-2">
//                   <label className="form-label">Mobile No</label>
//                   <input
//                     type="text"
//                     className="form-control form-control-sm"
//                     value={FormValue.Phone}
//                     onChange={(e) => handleInputChange("Phone", e.target.value)}
//                   />
//                 </div>

//                 {/* Customer Email */}
//                 <div className="col-4 p-2">
//                   <label className="form-label">Email</label>
//                   <input
//                     type="text"
//                     className="form-control form-control-sm"
//                     value={FormValue.CustomerEmail} // ✅ updated
//                     onChange={(e) =>
//                       handleInputChange("CustomerEmail", e.target.value)
//                     }
//                   />
//                 </div>

//                 {/* Category */}
//                 <div className="col-4 p-2">
//                   <label className="form-label">Category</label>
//                   <select
//                     className="form-control form-control-sm"
//                     value={FormValue.Category}
//                     onChange={(e) =>
//                       handleInputChange("Category", e.target.value)
//                     }
//                   >
//                     <option value="">Select Category</option>
//                     <option value="Dean">Dean</option>
//                     <option value="Teacher">Teacher</option>
//                     <option value="Chairman">Chairman</option>
//                     <option value="Officer">Officer</option>
//                   </select>
//                 </div>

//                 {/* Faculty */}
//                 {(FormValue.Category === "Dean" ||
//                   FormValue.Category === "Teacher" ||
//                   FormValue.Category === "Chairman") && (
//                   <div className="col-4 p-2">
//                     <label className="form-label">Faculty</label>
//                     <select
//                       className="form-control form-control-sm"
//                       value={FormValue.Faculty || ""}
//                       onChange={(e) =>
//                         handleInputChange("Faculty", e.target.value)
//                       }
//                     >
//                       <option value="">Select Faculty</option>
//                       {faculties.map((f) => (
//                         <option key={f._id} value={f._id}>
//                           {f.Name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 )}

//                 {/* Department */}
//                 {(FormValue.Category === "Teacher" ||
//                   FormValue.Category === "Chairman") && (
//                   <div className="col-4 p-2">
//                     <label className="form-label">Department</label>
//                     <select
//                       className="form-control form-control-sm"
//                       value={FormValue.Department || ""}
//                       onChange={(e) =>
//                         handleInputChange("Department", e.target.value)
//                       }
//                     >
//                       <option value="">Select Department</option>
//                       {departments.map((d) => (
//                         <option key={d._id} value={d._id}>
//                           {d.Name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 )}

//                 {/* Section */}
//                 {FormValue.Category === "Officer" && (
//                   <div className="col-4 p-2">
//                     <label className="form-label">Section</label>
//                     <select
//                       className="form-control form-control-sm"
//                       value={FormValue.Section || ""}
//                       onChange={(e) =>
//                         handleInputChange("Section", e.target.value)
//                       }
//                     >
//                       <option value="">Select Section</option>
//                       {sections.map((s) => (
//                         <option key={s._id} value={s._id}>
//                           {s.Name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 )}
//               </div>

//               {/* Save Button */}
//               <div className="row">
//                 <div className="col-4 p-2">
//                   <button
//                     type="button"
//                     onClick={SaveChange}
//                     className="btn btn-sm my-3 btn-success"
//                     disabled={loading}
//                   >
//                     {loading ? "Saving..." : "Save Change"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CustomerCreateUpdate;
