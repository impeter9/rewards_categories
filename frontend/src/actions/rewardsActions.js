import { GET_REWARDS, UPDATE_REWARDS } from './types';

export const getRewards = () => {
    return {
        type: GET_REWARDS
    };
};

export const updateRewards = (updatedRewards) => {
    return {
        type: UPDATE_REWARDS,
        payload: updatedRewards
    };
};