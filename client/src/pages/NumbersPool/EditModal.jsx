import React, { useState } from 'react';
import Modal from 'react-modal';
import parsePhoneNumber from 'libphonenumber-js';

const EditModal = (props) => {
  const { isOpen, onRequestClose, editNumber, editItem, removeNumber } = props;
  const [number, setNumber] = useState(editItem._id || '');
  const [parsedPhoneNumber, setParsedPhoneNumber] = useState(
    parsePhoneNumber(number.toString(), 'US')
  );
  const [order, setOrder] = useState(editItem.order || '');
  const [count, setCount] = useState(
    editItem.count === 0 || !!editItem.count ? editItem.count : ''
  );
  const [validOrder, setValidOrder] = useState(1);
  const [validNumber, setValidNumber] = useState(1);
  const [validCount, setValidCount] = useState(1);
  const [validation, setValidation] = useState('');
  const [available, setAvailable] = useState(editItem.available && true);

  const originalNumber = editItem._id || '';

  const validateNumber = () => {
    const item = parsePhoneNumber(number, 'US');
    setParsedPhoneNumber(item);
    if (!!item && item.isValid()) {
      setValidNumber(2);
    } else {
      setValidNumber(3);
    }
  };

  const validateOrder = () => {
    if (!!order && !isNaN(order)) {
      setValidOrder(2);
    } else {
      setValidOrder(3);
    }
  };

  const validateCount = () => {
    if (!!count && !isNaN(count)) {
      setValidCount(2);
    } else {
      setValidCount(3);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (number === '' || order === '' || count === '') {
      setValidation('Please complete all the fields!');
    } else {
      if (validNumber === 3 || validOrder === 3 || validCount === 3) {
        setValidation('Please fix incorrect inputs!');
      } else {
        editNumber({
          originalNumber,
          number: parsedPhoneNumber.nationalNumber || parsedPhoneNumber.number,
          order,
          available,
          count,
        });
        onRequestClose();
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      {...props}
      style={{
        content: {
          overflow: 'visible',
          position: 'relative',
          margin: '20% auto',
          width: '400px',
        },
        overlay: { background: 'rgb(105 105 105 / 75%)' },
      }}
      ariaHideApp={false}
      contentLabel='Call Detail'
    >
      <div
        style={{
          display: 'flex',
          padding: '20px 30px',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <h2 className='text-info'>Edit</h2>

        <form onSubmit={onSubmit}>
          <div
            className={`form-group ${validNumber === 2 ? 'has-success' : ''} ${
              validNumber === 3 ? 'has-danger' : ''
            }`}
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
              disabled
            />
            {validNumber === 3 && (
              <div className='invalid-feedback'>
                Sorry, Wrong Number format!
              </div>
            )}
          </div>

          <div
            className={`form-group ${validOrder === 2 ? 'has-success' : ''} ${
              validOrder === 3 ? 'has-danger' : ''
            }`}
          >
            <label
              className='col-form-label font-weight-bold'
              htmlFor='inputLarge2'
            >
              Order
            </label>
            <input
              className={`form-control form-control-lg ${
                validOrder === 2 ? 'is-valid' : ''
              } ${validOrder === 3 ? 'is-invalid' : ''}`}
              type='text'
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              onBlur={validateOrder}
              // placeholder='###-###-####'
              id='inputLarge2'
            />
            {validOrder === 3 && (
              <div className='invalid-feedback'>Sorry, Wrong format!</div>
            )}
          </div>

          <div
            className={`form-group ${validCount === 2 ? 'has-success' : ''} ${
              validCount === 3 ? 'has-danger' : ''
            }`}
          >
            <label
              className='col-form-label font-weight-bold'
              htmlFor='inputLarge2'
            >
              Count
            </label>
            <input
              className={`form-control form-control-lg ${
                validCount === 2 ? 'is-valid' : ''
              } ${validCount === 3 ? 'is-invalid' : ''}`}
              type='text'
              value={count}
              onChange={(e) => setCount(e.target.value)}
              onBlur={validateCount}
              // placeholder='###-###-####'
              id='inputLarge2'
            />
            {validCount === 3 && (
              <div className='invalid-feedback'>Sorry, Wrong format!</div>
            )}
          </div>

          <div>
            <div className='form-group'>
              <div className='custom-control custom-checkbox'>
                <input
                  type='checkbox'
                  className='custom-control-input'
                  id='customCheck1'
                  onChange={(e) => setAvailable(!available)}
                  checked={available}
                />
                <label className='custom-control-label' htmlFor='customCheck1'>
                  Available
                </label>
              </div>
            </div>
          </div>

          <button
            type='submit'
            className='btn btn-success mb-2'
            style={{ width: '100%' }}
          >
            Send
          </button>
          <button
            type='button'
            onClick={() => {
              removeNumber(editItem._id);
              onRequestClose();
            }}
            className='btn btn-danger'
            style={{ width: '100%' }}
          >
            Delete
          </button>
          <small style={{ color: '#e51c23' }}>{validation}</small>
          <br />
        </form>
      </div>
    </Modal>
  );
};

export default EditModal;
