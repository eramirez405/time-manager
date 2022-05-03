import axios from 'axios';
import {
  GET_NUMBERS,
  ADD_NUMBER,
  EDIT_NUMBER,
  TWILIO_ERROR,
  SET_LOADING_TRUE,
  REMOVE_NUMBER,
} from './types';

export const getNumbers = (formData) => async (dispatch) => {
  try {
    dispatch({
      type: SET_LOADING_TRUE,
    });

    const res = await axios.get('/api/numbersPool/getAll');
    dispatch({
      type: GET_NUMBERS,
      payload: res.data.result,
    });
  } catch (err) {
    console.log(err);
    dispatch({
      type: TWILIO_ERROR,
    });
  }
};

export const addNumber = (formData) => async (dispatch) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const res = await axios.post('/api/numbersPool/add', formData, config);
    if (res?.data?.result) {
      dispatch({
        type: ADD_NUMBER,
        payload: res.data.result,
      });
    } else {
      console.log(res.data);
      dispatch({
        type: TWILIO_ERROR,
      });
    }
  } catch (err) {
    console.log(err);
    dispatch({
      type: TWILIO_ERROR,
    });
  }
};

export const removeNumber = (formData) => async (dispatch) => {
  try {
    const res = await axios.delete('/api/numbersPool/delete/' + formData);
    if (res?.data?.result) {
      console.log(res.data.result);
      dispatch({
        type: REMOVE_NUMBER,
        payload: res.data.result,
      });
    } else {
      console.log(res.data);
      dispatch({
        type: TWILIO_ERROR,
      });
    }
  } catch (err) {
    console.log(err);
    dispatch({
      type: TWILIO_ERROR,
    });
  }
};

export const editNumber = (formData) => async (dispatch) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const res = await axios.post('/api/numbersPool/edit', formData, config);
    if (res?.data?.result) {
      dispatch({
        type: EDIT_NUMBER,
        payload: res.data.result,
      });
    } else {
      console.log(res.data);
      dispatch({
        type: TWILIO_ERROR,
      });
    }
  } catch (err) {
    console.log(err);
    dispatch({
      type: TWILIO_ERROR,
    });
  }
};

export const resetOutboundLimit = (formData) => async (dispatch) => {
  try {
    const res = await axios.put(`/api/outbound/${formData}`);
    if (res?.data) {
      return res.data;
    } else {
      return { error: true, errorMessage: 'No data returned' };
    }
  } catch (err) {
    console.log(err);
    return { error: true, errorMessage: 'Internal error, check the log' };
  }
};
