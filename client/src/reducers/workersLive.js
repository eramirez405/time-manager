import {
  GET_WORKERS_LIVE,
  GET_WORKERS_LIVE_ERROR,
  SET_LOADING_TRUE,
  EDIT_WORKERS_LIVE,
  UPDATE_AGENT_NOTE,
  UPDATE_AGENT_NOTESIS,
} from "../actions/types";

const initialState = { logs: [], loading: true };

export default function reducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    
    case GET_WORKERS_LIVE:
      

      return {
        ...state,
       logs: payload.filter(e=> e.workerLive.timeManage !== false).sort((a, b) => (a._id.email > b._id.email ? 1 : -1)),
       
       loading: false,
      };
    case SET_LOADING_TRUE:
      return { ...state, loading: true };
    case EDIT_WORKERS_LIVE:
      return {
        ...state,
        logs: [
          ...state.logs.map((e) => {
            if (e.workerLive.email == payload.user) {
              e.workerLive.activity = payload.activity;
              return e;
            } else {
              return e;
            }
          }),
        ].sort((a, b) => (a._id.email > b._id.email ? 1 : -1)),
      };

    case GET_WORKERS_LIVE_ERROR:
      return { ...state, logs: [], loading: false };
    case UPDATE_AGENT_NOTE:
      return {
        ...state,
        logs: state.logs
          .map((item) => {
            if (item.workerLive.email === payload.id) {
              if (!item.workerLive.dailyNotes) {
                item.workerLive.dailyNotes = [];
                item.workerLive.dailyNotes.push({note:payload.note,
                  timestamp:payload.timestamp});
              } else {
                item.workerLive.dailyNotes.push({note:payload.note,
                  timestamp:payload.timestamp});
              }
            }
            return item;
          })
          .sort((a, b) => (a._id.email > b._id.email ? 1 : -1)),
      };

    case UPDATE_AGENT_NOTESIS:
      return {
        ...state,

        logs: state.logs
          .map((item) => {
            if (item.workerLive.email === payload.id) {
              if (!item.workerLive.sisNotes) {
                item.workerLive.sisNotes = [];
                item.workerLive.sisNotes.push({note:payload.note,
                  timestamp:payload.timestamp});
              } else {
                item.workerLive.sisNotes.push({note:payload.note,
                  timestamp:payload.timestamp});
              }
            }
            return item;
          })
          .sort((a, b) => (a._id.email > b._id.email ? 1 : -1)),
      };
    default:
      return state;
  }
}
