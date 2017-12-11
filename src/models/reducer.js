import { Map, List } from 'immutable';
import { combineReducers } from 'redux';

const ADD_NODE = 'ADD_NODE';
const UPDATE_FINGER = 'UPDATE_FINGER';

export const addNode = ({ hash, ip, position }) => ({
  type: ADD_NODE,
  hash,
  ip,
  position,
});

export const updateFinger = ({hash, fingerNo, pointsTo}) => ({
  type: UPDATE_FINGER,
  hash,
  fingerNo,
  pointsTo,
});

const nullList = [];
for (let i = 0; i < 8; ++i) { nullList.push(null) }

// Node {
//   hash, ip,
//   [fingers]
// }
const reducer = (state = Map(), action) => {
  const { hash } = action;
  switch (action.type) {
    case ADD_NODE:
      const { ip, position } = action;
      return state.set(hash, { hash, ip, position, fingers: List(nullList) })
    case UPDATE_FINGER:
      const { fingerNo, pointsTo } = action;
      const newState = state.update(hash, value =>
        Object.assign(value, { fingers: value.fingers.set(fingerNo, pointsTo) })
      );
      return newState;
    default:
      return state;
  }
}

const CHANGE_LOG = 'CHANGE_LOG';

export const changeLog = line => ({ type: CHANGE_LOG, line });

const logReducer = (state = '', action) => {
  switch (action.type) {
    case CHANGE_LOG:
      return action.line;
    default:
      return state;
  }
}

export default combineReducers({
  graph: reducer, log: logReducer}
);