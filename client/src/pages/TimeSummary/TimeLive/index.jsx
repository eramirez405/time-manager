import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

const TimeLive = () => {
  return (
    <div>
      <h3>This is the timelive</h3>
    </div>
  );
};

TimeLive.propTypes = {};

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(TimeLive);
