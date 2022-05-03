import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import SearchForm from "./SearchForm";
import Table from "./Table";
import RegisterModal from "./RegisterModal";
import { getAllUsers } from "../../actions/userManagement";

const UserManagement = ({ getAllUsers, users, user }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    getAllUsers();
  }, []);

  return (
    <div className="container-fluid">
      <SearchForm openModal={() => setIsOpen(true)} user={user} />

      {!!isOpen && (
        <RegisterModal
          isOpen={isOpen}
          onRequestClose={() => {
            setIsOpen(false);
          }}
        />
      )}
      <br />
      <Table
        data={users.sort((a, b) => {
          if (a.date > b.date) return 1;
          if (a.date < b.date) return -1;
          return 0;
        })}
      />
    </div>
  );
};

UserManagement.propTypes = {
  users: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
  getAllUsers: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  users: state.userManagement.logs,
  user: state.auth.user,
});

export default connect(mapStateToProps, { getAllUsers })(UserManagement);
