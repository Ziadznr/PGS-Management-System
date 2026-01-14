// src/components/MasterLayout/MasterLayout.jsx
import React, { Fragment, useRef } from "react";
import { Accordion, Container, Navbar } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import {
  AiOutlineBank,
  AiOutlineLogout,
  AiOutlineMenu,
  AiOutlineUser,
  AiOutlineUnorderedList,
} from "react-icons/ai";
import {
  BsBagPlus,
  BsBagX,
  BsBox,
  BsCartPlus,
  BsCircle,
  BsGraphUp,
  BsPeople,
} from "react-icons/bs";
import { IoCreateOutline } from "react-icons/io5";
import { RiDashboardLine } from "react-icons/ri";
import { TbTruckDelivery } from "react-icons/tb";

import logo from "../../assets/images/ps.png";
import { removeSessions } from "../../helper/SessionHelper";

// ✅ import redux
import { useSelector, useDispatch } from "react-redux";
import { SetProfile } from "../../redux/state-slice/profile-slice";

const MasterLayout = (props) => {
  const sideNavRef = useRef();
  const contentRef = useRef();
  const topNavRef = useRef();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ Get profile directly from redux
  const profile = useSelector((state) => state.profile.value);

  const user = {
    firstName: profile?.firstName || "Guest",
    photo: profile?.photo || "defaultPhoto.png",
  };

  // Sidebar toggle
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

  const onLogout = () => {
    removeSessions();
    dispatch(SetProfile({})); // ✅ reset redux profile
    navigate("/Login");
  };

  // Sidebar items
  const sidebarItems = [
    {
      title: "Dashboard",
      icon: <RiDashboardLine className="side-bar-item-icon" />,
      url: "/",
      subMenu: [],
    },
    {
      title: "Notice Management",
      icon: <BsPeople className="side-bar-item-icon" />,
      url: "/notices",
      subMenu: [{ title: "Notice", icon: <BsCircle size={16} />, url: "/notices" }],
    },
    {
      title: "Department",
      icon: <BsPeople className="side-bar-item-icon" />,
      url: "/department-list",
      subMenu: [
        { title: "Department List", icon: <BsCircle size={16} />, url: "/department-list" },
        { title: "Add Department", icon: <BsCircle size={16} />, url: "/DepartmentCreateUpdatePage" },
      ],
    },
     {
      title: "Season",
      icon: <BsPeople className="side-bar-item-icon" />,
      url: "/admission-seasons",
      subMenu: [
        { title: "Admission-Season", icon: <BsCircle size={16} />, url: "/admission-seasons" },
        { title: "Range SetUp", icon: <BsCircle size={16} />, url: "/season-range" },
      ],
    },
    {
      title: "User",
      icon: <BsPeople className="side-bar-item-icon" />,
      url: "/Customer",
      subMenu: [
        { title: "New User", icon: <BsCircle size={16} />, url: "/CustomerCreateUpdatePage" },
        { title: "Users List", icon: <BsCircle size={16} />, url: "/CustomerListPage" },
      ],
    },
   
  ];

  const isSidebarAccordionActive = () => {
    for (let i = 0; i < sidebarItems.length; i++) {
      const item = sidebarItems[i];
      if (item.subMenu.some((sub) => sub.url === window.location.pathname)) {
        return i;
      }
    }
    return null;
  };

  return (
    <Fragment>
      {/* Navbar */}
      <Navbar className="fixed-top px-0">
        <Container fluid>
          <Navbar.Brand>
            <div ref={topNavRef} className="top-nav-open">
              <h4 className="text-white m-0 p-0">
                <a onClick={MenuBarClickHandler}>
                  <AiOutlineMenu />
                </a>
              </h4>
            </div>
          </Navbar.Brand>

          {/* User dropdown */}
          <div className="float-right h-auto d-flex align-items-center">
            <div className="user-dropdown">
              <img className="icon-nav-img" src={user.photo} alt="User" />
              <div className="user-dropdown-content">
                <div className="mt-4 text-center">
                  <img className="icon-nav-img" src={user.photo} alt="User" />
                  <h6>{user.firstName}</h6>
                  <hr className="user-dropdown-divider p-0" />
                </div>
                <NavLink to="/Profile" className="side-bar-item">
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
      <div ref={sideNavRef} className="side-nav-open border-radius-0 card">
        <NavLink to="/" end className="d-flex justify-content-center sticky-top bg-white">
          <img src={logo} className="logo" alt="Logo" />
        </NavLink>

        <Accordion defaultActiveKey={`${isSidebarAccordionActive()}`}>
          {sidebarItems.map((item, index) =>
            item.subMenu.length ? (
              <Accordion.Item key={index} eventKey={`${index}`} className="mt-2">
                <Accordion.Header>
                  <div className="side-bar-item">
                    {item.icon}
                    <span className="side-bar-item-caption">{item.title}</span>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  {item.subMenu.map((subItem, subIndex) => (
                    <NavLink
                      key={subIndex}
                      className={(navData) =>
                        navData.isActive
                          ? "side-bar-subitem-active side-bar-subitem"
                          : "side-bar-subitem"
                      }
                      to={subItem.url}
                      end
                    >
                      {subItem.icon}
                      <span className="side-bar-subitem-caption">{subItem.title}</span>
                    </NavLink>
                  ))}
                </Accordion.Body>
              </Accordion.Item>
            ) : (
              <NavLink
                key={index}
                className={(navData) =>
                  navData.isActive ? "side-bar-item-active side-bar-item mt-2" : "side-bar-item mt-2"
                }
                to={item.url}
                end
              >
                {item.icon}
                <span className="side-bar-item-caption">{item.title}</span>
              </NavLink>
            )
          )}
        </Accordion>
      </div>

      {/* Main Content */}
      <div ref={contentRef} className="content">
        {props.children}
      </div>
    </Fragment>
  );
};

export default MasterLayout;
