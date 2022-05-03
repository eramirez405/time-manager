import React from "react";
import { Route, Redirect } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";

const PrivateRoute = ({
  component: Component,
  auth: { isAuthenticated, loading },
  user,
  roles,
  ...rest
}) => {
  if (loading) {
    return <div />;
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        !isAuthenticated && !loading ? (
          <Redirect to="/login" />
        ) : !!user?.role && roles.includes(user?.role) ? (
          <Component {...props} />
        ) : (
          <>
            <Redirect to="/" />
            <Component {...props} />
          </>
        )
      }
    />
  );
};

PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  user: state.auth.user,
});

export default connect(mapStateToProps)(PrivateRoute);
