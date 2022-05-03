import {
  GET_WORKSUMMARY,
  TWILIO_ERROR,
  SET_LOADING_TRUE,
} from '../actions/types';

const initialState = { logs: [], loading: true, total: {} };

export default function reducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_WORKSUMMARY:
      return {
        ...state,
        logs: payload.logs,
        total: payload.total,
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
