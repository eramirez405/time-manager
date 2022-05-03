import React from 'react';

const NumberCard = ({
  order,
  editMode,
  setEditItem,
  setEditModalOpen,
  item,
}) => {
  return (
    <div
      className='card border-primary mb-3'
      style={{ maxWidth: '20rem' }}
      onClick={() => {
        if (editMode) {
          setEditItem(item);
          setEditModalOpen(true);
        }
      }}
    >
      <div className='card-header'>
        {order}) <span className='float-right'>{item._id}</span>
      </div>
      <div className='card-body'>
        <h4 className='card-title mb-4'>
          Counter :{' '}
          <button type='button' className='btn btn-secondary float-right'>
            {item.count}
          </button>
        </h4>
      </div>
    </div>
  );
};

export default NumberCard;
