import React from "react";
import { connect } from "react-redux";
import {
  FiPower,
  FiLayers,
  FiUsers,
  FiClock,
  FiGrid,
  FiAperture,
  FiActivity,
} from "react-icons/fi";
import { CgGirl } from "react-icons/cg";
import { RiAdminLine } from "react-icons/ri";
import { logout } from "../../actions/auth";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const NavBar = ({ isAuthenticated, user, logout }) => {
  return (
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <img
          src="favicon.png"
          alt="Logo"
          height="40px"
          style={{ marginRight: "10px" }}
        />

        <Link className="navbar-brand" to="/">
          Time Manager 2.0
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          {isAuthenticated && !!user && (
            <>
              <ul className="navbar-nav mr-auto">
                {!!user?.role &&
                  (user.role === "admin" ||
                    user.role === "supervisor" ||
                    user.role === "lead") && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/tasks">
                        <FiLayers size={17} style={{ marginRight: "10px" }} />
                        Tasks
                      </Link>
                    </li>
                  )}

                <li className="nav-item">
                  <Link className="nav-link" to="/workers">
                    <FiUsers size={17} style={{ marginRight: "10px" }} />
                    Workers
                  </Link>
                </li>

                {!!user?.role &&
                  (user.role === "admin" || user.role === "supervisor") && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/workSummary">
                        <FiClock size={17} style={{ marginRight: "10px" }} />
                        Work Summary
                      </Link>
                    </li>
                  )}
                {!!user?.role && ["admin", "supervisor"].includes(user.role) && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/userManagement">
                      <RiAdminLine size={17} style={{ marginRight: "10px" }} />
                      User Management
                    </Link>
                  </li>
                )}

                {!!user?.role && user.role === "admin" && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/numbersPool">
                      <FiGrid size={17} style={{ marginRight: "10px" }} />
                      Outbound
                    </Link>
                  </li>
                )}
                {!!user?.role && ["admin"].includes(user.role) && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/timeSummary">
                      <FiAperture size={17} style={{ marginRight: "10px" }} />
                      Time Summary
                    </Link>
                  </li>
                )}
                {!!user?.role && ["admin", "supervisor"].includes(user.role) && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/workersLive">
                      <FiActivity size={17} style={{ marginRight: "10px" }} />
                      Workers Live
                    </Link>
                  </li>
                )}
                 {!!user?.role && ["admin", "julia", "supervisor"].includes(user.role) && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/juliaHome">
                      <CgGirl size={20} style={{ marginRight: "10px" }} />
                      Julia Dashboard
                    </Link>
                  </li>
                )}
              </ul>
              <span className="navbar-text">
                Welcome, <span className="text-success">{user.name}</span>
              </span>
              <span
                className="navbar-text mx-3"
                style={{ cursor: "pointer" }}
                onClick={logout}
              >
                <FiPower size={25} />
              </span>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

NavBar.propTypes = {
  logout: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
  user: PropTypes.object,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  user: state.auth.user,
});

export default connect(mapStateToProps, { logout })(NavBar);
