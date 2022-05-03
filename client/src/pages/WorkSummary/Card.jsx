import React from 'react';

const Card = ({ data }) => {
  const {
    cumulative: {
      reservations_created,
      reservations_accepted,
      reservations_rejected,
      reservations_timed_out,
      reservations_canceled,
      reservations_completed,
      activity_durations,
    },
    realtime: { total_workers, activity_statistics },
  } = data;

  return (
    <div className='row'>
      <div className='col-md-4'>
        <h5 className='text-info'>Reservations Total</h5>
        <ul className='list-group'>
          {(reservations_created === 0 || reservations_created) && (
            <li className='list-group-item d-flex justify-content-between align-items-center'>
              Created
              <span className='badge badge-primary badge-pill'>
                {reservations_created}
              </span>
            </li>
          )}
          {(reservations_accepted === 0 || reservations_accepted) && (
            <li className='list-group-item d-flex justify-content-between align-items-center'>
              Accepted
              <span className='badge badge-primary badge-pill'>
                {reservations_accepted}
              </span>
            </li>
          )}
          {(reservations_rejected === 0 || reservations_rejected) && (
            <li className='list-group-item d-flex justify-content-between align-items-center'>
              Rejected
              <span className='badge badge-primary badge-pill'>
                {reservations_rejected}
              </span>
            </li>
          )}
          {(reservations_timed_out === 0 || reservations_timed_out) && (
            <li className='list-group-item d-flex justify-content-between align-items-center'>
              Timed Out
              <span className='badge badge-primary badge-pill'>
                {reservations_timed_out}
              </span>
            </li>
          )}
          {(reservations_canceled === 0 || reservations_canceled) && (
            <li className='list-group-item d-flex justify-content-between align-items-center'>
              Canceled
              <span className='badge badge-primary badge-pill'>
                {reservations_canceled}
              </span>
            </li>
          )}
          {(reservations_completed === 0 || reservations_completed) && (
            <li className='list-group-item d-flex justify-content-between align-items-center'>
              Completed
              <span className='badge badge-primary badge-pill'>
                {reservations_completed}
              </span>
            </li>
          )}
        </ul>
      </div>

      {total_workers && activity_statistics && (
        <div className='col-md-4'>
          <h5 className='text-info'>Current Activities</h5>
          <ul className='list-group'>
            {activity_statistics.map((e) => (
              <li className='list-group-item d-flex justify-content-between align-items-center'>
                {e.friendly_name}
                <span className='badge badge-primary badge-pill'>
                  {e.workers}
                </span>
              </li>
            ))}
            <br />
            <li className='list-group-item d-flex justify-content-between align-items-center'>
              Total
              <span className='badge badge-primary badge-pill'>
                {total_workers}
              </span>
            </li>
          </ul>
        </div>
      )}

      {activity_durations && activity_durations.length > 0 && (
        <div className='col-md-4'>
          <h5 className='text-info'>Activity Average</h5>
          <ul className='list-group'>
            {activity_durations.map((e) => (
              <li className='list-group-item d-flex justify-content-between align-items-center'>
                {e.friendly_name}
                <span className='badge badge-primary badge-pill'>
                  {Math.round(e.avg / 60) > 1
                    ? Math.round(e.avg / 60) + ' min'
                    : Math.round(((e.avg / 60) % 1) * 60) + ' seg'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Card;
