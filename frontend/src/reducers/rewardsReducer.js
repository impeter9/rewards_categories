import { GET_REWARDS, UPDATE_REWARDS } from '../actions/types';

const initialState = {
    rewards: []
}

export default function(state = initialState, action) {
    switch(action.type) {
        case GET_REWARDS:
            return {
                ...state
            };
        case UPDATE_REWARDS:
            return {
                ...state,
                rewards: action.payload
            }
        default:
            return state;
    }
}