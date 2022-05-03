import axios from 'axios';
import { GET_TASKQUEUES, TWILIO_ERROR, SET_LOADING_TRUE } from './types';

export const getTaskQueue = () => async (dispatch) => {
  try {
    dispatch({
      type: SET_LOADING_TRUE,
    });

    const res = await axios.get('/api/twilio/taskQueue');
    dispatch({
      type: GET_TASKQUEUES,
      payload: res.data.result,
    });
  } catch (err) {
    console.log(err);
    dispatch({
      type: TWILIO_ERROR,
    });
  }
};
