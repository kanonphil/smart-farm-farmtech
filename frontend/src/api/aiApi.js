import { axiosInstance } from "./axiosInstance";

/**
 * Ai에게 요청보낼 api
 * @param {*} servings 
 * @param {*} menu 
 * @returns 
 */
export const getRecipe = async (servings, menu) => {
  const response = await axiosInstance.post('/ai/recipe', {servings, menu})
  return response.data
}