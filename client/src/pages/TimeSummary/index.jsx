import React from "react";
import Location from "./Location";
import TimeReport from "./TimeReport";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import TimeLive from "./TimeLive";

const TimeSummary = ({ user }) => {
  return (
    <div>
      <div className="container-fluid">
        {user?.role === "admin" ? (
          <>
            <TimeReport />
            <hr />
            <Location />
            <br />
          </>
        ) : (
          <TimeLive />
        )}
      </div>
    </div>
  );
};

TimeSummary.propTypes = {
  user: PropTypes.object,
};

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps, {})(TimeSummary);
