import axios from 'axios';
import { GET_WORKSUMMARY, TWILIO_ERROR, SET_LOADING_TRUE } from './types';

export const getWorkSummary = (formData) => async (dispatch) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    dispatch({
      type: SET_LOADING_TRUE,
    });

    const res = await axios.post('/api/twilio/workSummary', formData, config);
    dispatch({
      type: GET_WORKSUMMARY,
      payload: { total: res.data.total, logs: res.data.logs },
    });
  } catch (err) {
    console.log(err);
    dispatch({
      type: TWILIO_ERROR,
    });
  }
};
