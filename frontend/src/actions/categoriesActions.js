import { GET_CATEGORIES, UPDATE_CATEGORIES } from './types';

export const getCategories = () => {
    return {
        type: GET_CATEGORIES
    };
};

export const updateCategories = (updatedCategories) => {
    return {
        type: UPDATE_CATEGORIES,
        payload: updatedCategories
    };
};