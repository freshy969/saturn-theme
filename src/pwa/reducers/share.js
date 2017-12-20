import { combineReducers } from 'redux';
import * as actionTypes from '../actionTypes';

const isOpen = (state = false, action) => {
  switch (action.type) {
    case actionTypes.SHARE_MODAL_OPENING_REQUESTED:
      return true;
    case actionTypes.SHARE_MODAL_CLOSING_REQUESTED:
      return false;
    default:
      return state;
  }
};

const id = (state = null, action) => {
  switch (action.type) {
    case actionTypes.SHARE_MODAL_OPENING_REQUESTED:
      return action.id;
    default:
      return state;
  }
};

const wpType = (state = null, action) => {
  switch (action.type) {
    case actionTypes.SHARE_MODAL_OPENING_REQUESTED:
      return action.wpType;
    default:
      return state;
  }
};

const counts = (state = {}, action) => {
  switch (action.type) {
    case actionTypes.SHARE_COUNT_SUCCEED:
      return { ...state, [action.id]: { ...state[action.id], [action.network]: action.value } };
    default:
      return state;
  }
};

const isReady = (state = {}, action) => {
  switch (action.type) {
    case actionTypes.ALL_SHARE_COUNT_RESOLVED:
      return { ...state, [action.id]: true };
    default:
      return state;
  }
};

const linkCopied = (state = false, action) => {
  switch (action.type) {
    case actionTypes.LINK_COPIED:
      return action.value;
    default:
      return state;
  }
};

const entities = combineReducers({
  counts,
  isReady,
});

const share = combineReducers({
  isOpen,
  id,
  wpType,
  entities,
  linkCopied,
});

export default share;