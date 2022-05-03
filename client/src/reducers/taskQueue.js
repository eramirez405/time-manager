import {
  GET_TASKQUEUES,
  TWILIO_ERROR,
  SET_LOADING_TRUE,
} from '../actions/types';

const initialState = { logs: [], loading: true };

export default function reducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_TASKQUEUES:
      return {
        ...state,
        logs: payload,
        loading: false,
      };
    case SET_LOADING_TRUE:
      return { ...state, loading: true };
    case TWILIO_ERROR:
      return { ...state, logs: [], loading: false };
    default:
      return state;
  }
}
