import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import NumberCard from './NumberCard';
import { FiPlus } from 'react-icons/fi';
import Switch from 'react-switch';
import EditModal from './EditModal';
import AddModal from './AddModal';
import {
  getNumbers,
  addNumber,
  editNumber,
  removeNumber,
  resetOutboundLimit,
} from '../../actions/numbers';
import notie from 'notie';

const NumbersPool = ({
  user,
  loading,
  getNumbers,
  logs,
  addNumber,
  editNumber,
  removeNumber,
  resetOutboundLimit,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [number, setNumber] = useState('');
  const [validNumber, setValidNumber] = useState(1);
  const [validation, setValidation] = useState('');

  const validateNumber = () => {
    if (!!number && number.length > 1) {
      setValidNumber(2);
    } else {
      setValidNumber(3);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (number === '') {
      setValidation('Please complete all the fields!');
    } else {
      if (validNumber === 3) {
        setValidation('Please fix incorrect inputs!');
      } else {
        // Process the request
        const result = await resetOutboundLimit(number);
        if (result.error) {
          notie.alert({
            type: 3, // optional, default = 4, enum: [1, 2, 3, 4, 5, 'success', 'warning', 'error', 'info', 'neutral']
            text: result.errorMessage,
            stay: false, // optional, default = false
            time: 2, // optional, default = 3, minimum = 1,
            position: 'top', // optional, default = 'top', enum: ['top', 'bottom']
          });
        } else {
          notie.alert({
            type: 1, // optional, default = 4, enum: [1, 2, 3, 4, 5, 'success', 'warning', 'error', 'info', 'neutral']
            text: 'Limit reset successful',
            stay: false, // optional, default = false
            time: 2, // optional, default = 3, minimum = 1,
            position: 'top', // optional, default = 'top', enum: ['top', 'bottom']
          });
        }
      }
    }
  };

  useEffect(() => {
    getNumbers();
  }, []);

  if (loading) {
    return (
      <div className='container'>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!!user?.role && user.role === 'admin') {
    return (
      <div className='container'>
        <div className='mb-4 d-flex'>
          <div className='d-flex ml-auto'>
            {editMode && (
              <div className='mx-2'>
                <FiPlus
                  size={30}
                  color='#033c73'
                  style={{ cursor: 'pointer' }}
                  onClick={() => setAddModalOpen(true)}
                />
              </div>
            )}
            <div>
              <Switch onChange={(e) => setEditMode(e)} checked={editMode} />
            </div>
          </div>
        </div>
        <div className='row'>
          {/* {testData.map((e) => (
            <div className='col-md-3'>
              <NumberCard
                index={e.index}
                editMode={editMode}
                setEditItem={setEditItem}
                setEditModalOpen={setEditModalOpen}
                item={e}
              />
            </div>
          ))} */}
          {logs
            .sort((a, b) => {
              if (a.order > b.order) return 1;
              if (a.order < b.order) return -1;
              return 0;
            })
            .map((e) => (
              <div className='col-md-3' key={e.order}>
                <NumberCard
                  order={e.order}
                  editMode={editMode}
                  setEditItem={setEditItem}
                  setEditModalOpen={setEditModalOpen}
                  item={e}
                />
              </div>
            ))}
        </div>
        <br />
        <hr />
        <h4>Reset number outbound limit</h4>
        <div className='row'>
          <div className='col-12 col-md-8 col-lg-5'>
            <form onSubmit={onSubmit}>
              <div
                className={`form-group ${
                  validNumber === 2 ? 'has-success' : ''
                } ${validNumber === 3 ? 'has-danger' : ''}`}
              >
                <label
                  className='col-form-label font-weight-bold'
                  htmlFor='inputLarge1'
                >
                  Number
                </label>
                <input
                  className={`form-control form-control-lg ${
                    validNumber === 2 ? 'is-valid' : ''
                  } ${validNumber === 3 ? 'is-invalid' : ''}`}
                  type='text'
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  onBlur={validateNumber}
                  // placeholder='###-###-####'
                  id='inputLarge1'
                />
                {validNumber === 3 && (
                  <div className='invalid-feedback'>
                    Sorry, Wrong Number format!
                  </div>
                )}
              </div>
              <button
                type='submit'
                className='btn btn-success'
                style={{ width: '100%' }}
              >
                Send
              </button>
              <small style={{ color: '#e51c23' }}>{validation}</small>
              <br />
            </form>
          </div>
        </div>

        {editModalOpen && (
          <EditModal
            isOpen={editModalOpen}
            onRequestClose={() => setEditModalOpen(false)}
            editItem={editItem}
            editNumber={editNumber}
            removeNumber={removeNumber}
          />
        )}
        {addModalOpen && (
          <AddModal
            isOpen={addModalOpen}
            onRequestClose={() => setAddModalOpen(false)}
            addNumber={addNumber}
          />
        )}
      </div>
    );
  } else {
    return <Redirect to='/' />;
  }
};

NumbersPool.propTypes = {
  user: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  getNumbers: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  user: state.auth.user,
  loading: state.auth.loading,
  logs: state.numbers.logs,
});

export default connect(mapStateToProps, {
  getNumbers,
  addNumber,
  editNumber,
  removeNumber,
  resetOutboundLimit,
})(NumbersPool);
