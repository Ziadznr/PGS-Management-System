// src/components/UserLayout/UserLayout.jsx
import React, { Fragment, useRef } from "react";
import { Accordion, Container, Navbar } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { AiOutlineMenu, AiOutlineUser, AiOutlineLogout } from "react-icons/ai";
import { BsGraphUp, BsPeople, BsCircle, BsThreeDotsVertical  } from "react-icons/bs";

import logo from "../../assets/images/ps.png";
import { removeSessions } from "../../helper/SessionHelper";

// Redux
import { useSelector, useDispatch } from "react-redux";
import { ClearUserProfile } from "../../redux/state-slice/userProfile-slice";

const UserLayout = ({ children }) => {

  const sideNavRef = useRef();
  const contentRef = useRef();
  const topNavRef = useRef();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ Get user from redux
  const { user } = useSelector((state) => state.userProfile);

  const userName = user ? user.name : "Guest";
const nameExtension = user?.nameExtension || "";

  // const userPhoto = user?.photo || "defaultPhoto.png";
  const userRole = user?.role; // Student | Supervisor | Chairman | Dean

  // ---------------- Sidebar toggle ----------------
  const MenuBarClickHandler = () => {
    const sideNav = sideNavRef.current;
    const content = contentRef.current;
    const topNav = topNavRef.current;

    if (sideNav.classList.contains("side-nav-open")) {
      sideNav.classList.replace("side-nav-open", "side-nav-close");
      content.classList.replace("content", "content-expand");
      topNav.classList.replace("top-nav-open", "top-nav-close");
    } else {
      sideNav.classList.replace("side-nav-close", "side-nav-open");
      content.classList.replace("content-expand", "content");
      topNav.classList.replace("top-nav-close", "top-nav-open");
    }
  };

  // ---------------- Logout ----------------
  const onLogout = () => {
    removeSessions();
    dispatch(ClearUserProfile());
    navigate("/users/login");
  };

  // ---------------- Sidebar by role ----------------
  const sidebarByRole = {
    Student: [
      {
        title: "Admission",
        icon: <BsGraphUp className="side-bar-item-icon" />,
        subMenu: [
          { title: "My Application", icon: <BsCircle />, url: "/users/application" },
          { title: "Enrollment Status", icon: <BsCircle />, url: "/users/enrollment" }
        ]
      }
    ],

    Supervisor: [
      {
        title: "Admissions",
        icon: <BsGraphUp />,
        subMenu: [
          { title: "Applications", icon: <BsCircle />, url: "/admission/supervisor/applications" }
        ]
      }
    ],

    Chairman: [
         {
  title: "Supervisors",
  icon: <BsPeople className="side-bar-item-icon" />,
  subMenu: [
    {
      title: (
        <span className="submenu-item">
          <BsCircle size={8} className="submenu-dot" />
          Supervisor List
        </span>
      ),
      url: "/ChairmanSupervisorsListPage"
    }
  ]
},
        {
  title: "BluePrint",
  icon: <BsPeople className="side-bar-item-icon" />,
  subMenu: [
    {
      title: (
        <span className="submenu-item">
          <BsCircle size={8} className="submenu-dot" />
          Application Decision
        </span>
      ),
      url: "/ChairmanDecisionBlueprintListPage"
    }
  ]
}
    ],

    Dean: [
     {
  title: "Members",
  icon: <BsPeople className="side-bar-item-icon" />,
  subMenu: [
    {
      title: (
        <span className="submenu-item">
          <BsCircle size={8} className="submenu-dot" />
          Member List
        </span>
      ),
      url: "/DeanUsersListPage"
    }
  ]
},
 {
  title: "Tenure",
  icon: <BsPeople className="side-bar-item-icon" />,
  subMenu: [
    {
      title: (
        <span className="submenu-item">
          <BsCircle size={8} className="submenu-dot" />
          Tenure Record
        </span>
      ),
      url: "/ChairmanTenurePage"
    }
  ]
}
    ]
  };

  const sidebarItems = sidebarByRole[userRole] || [];

  const activeAccordion = sidebarItems.findIndex(item =>
    item.subMenu.some(sub => sub.url === window.location.pathname)
  );

  return (
    <Fragment>
      {/* Top Navbar */}
      <Navbar className="fixed-top px-0">
        <Container fluid>
          <Navbar.Brand>
            <div ref={topNavRef} className="top-nav-open">
              <h4 className="text-white m-0">
                <AiOutlineMenu onClick={MenuBarClickHandler} />
              </h4>
            </div>
          </Navbar.Brand>

          {/* User dropdown */}
          <div className="d-flex align-items-center">
            <div className="user-dropdown">
              <button className="icon-button"><BsThreeDotsVertical /></button>
              <div className="user-dropdown-content">
                <div className="mt-4 text-center">
                  {/* <img className="icon-nav-img" src={userPhoto} alt="User" /> */}
                  <div className="user-card">
  <h6>{userName}</h6>
  {nameExtension && <span>{nameExtension}</span>}
  <small>{userRole}</small>
</div>
                  <hr />
                </div>

                <NavLink to="/users/profile" className="side-bar-item">
                  <AiOutlineUser className="side-bar-item-icon" />
                  <span className="side-bar-item-caption">Profile</span>
                </NavLink>

                <a onClick={onLogout} className="side-bar-item">
                  <AiOutlineLogout className="side-bar-item-icon" />
                  <span className="side-bar-item-caption">Logout</span>
                </a>
              </div>
            </div>
          </div>
        </Container>
      </Navbar>

      {/* Sidebar */}
      <div ref={sideNavRef} className="side-nav-open card">
        <NavLink to="/users/dashboard" className="d-flex justify-content-center bg-white">
          <img src={logo} className="logo" alt="Logo" />
        </NavLink>

        <Accordion defaultActiveKey={`${activeAccordion}`}>
          {sidebarItems.map((item, i) => (
            <Accordion.Item key={i} eventKey={`${i}`}>
              <Accordion.Header>
                <div className="side-bar-item">
                  {item.icon}
                  <span>{item.title}</span>
                </div>
              </Accordion.Header>

              <Accordion.Body>
                {item.subMenu.map((sub, j) => (
                  <NavLink
                    key={j}
                    to={sub.url}
                    className={({ isActive }) =>
                      isActive ? "side-bar-subitem-active side-bar-subitem" : "side-bar-subitem"
                    }
                  >
                    {sub.icon}
                    <span>{sub.title}</span>
                  </NavLink>
                ))}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>

      {/* Content */}
      <div ref={contentRef} className="content">
        {children}
      </div>
    </Fragment>
  );
};

export default UserLayout;
