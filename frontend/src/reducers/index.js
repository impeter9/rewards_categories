import { combineReducers } from 'redux';
import rewardsReducer from './rewardsReducer';
import categoriesReducer from './categoriesReducer';

export default combineReducers({
    rewards: rewardsReducer,
    categories: categoriesReducer
});