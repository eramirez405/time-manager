import {
  GET_NUMBERS,
  ADD_NUMBER,
  EDIT_NUMBER,
  TWILIO_ERROR,
  SET_LOADING_TRUE,
  REMOVE_NUMBER,
} from '../actions/types';

const initialState = { logs: [], loading: true };

export default function reducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_NUMBERS:
      return { ...state, logs: payload, loading: false };
    case ADD_NUMBER:
      return { ...state, logs: [...state.logs, payload], loading: false };
    case EDIT_NUMBER:
      return {
        ...state,
        logs: [
          ...state.logs.filter((i) => i._id !== payload._id),
          payload,
        ].sort((a, b) => {
          if (a.order > b.order) return 1;
          if (a.order < b.order) return -1;
          return 0;
        }),
        loading: false,
      };
    case REMOVE_NUMBER:
      return {
        ...state,
        logs: state.logs.filter((i) => i._id !== payload._id),
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
