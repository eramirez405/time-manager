import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Table from './Table';
import SearchForm from './SearchForm';
import Card from './Card';

const WorkSummary = ({ workSummary, total, loading }) => {
  return (
    <div className='container-fluid'>
       <SearchForm data={{ workSummary, total }} /> 
      <br />
      {!loading && <Table data={{ workSummary, total }} />}
      {!loading && <Card data={total} />}
    </div>
  );
};

WorkSummary.propTypes = {
  workSummary: PropTypes.array.isRequired,
  total: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
};



const mapStateToProps = (state) => ({
  workSummary: state.workSummary.logs,
  total: state.workSummary.total,
  loading: state.workSummary.loading,
});

export default connect(mapStateToProps)(WorkSummary);
