export const BASE_URL = "http://127.0.0.1:8000"

export const POST_REGISTER = `${BASE_URL}/users/register/`
export const POST_LOGIN = `${BASE_URL}/users/login/`
export const GET_ME = `${BASE_URL}/users/me`

export const POST_AD = `${BASE_URL}/ads/create/`

export const GET_CATEGORIES = `${BASE_URL}/categories/get`
export const GET_ADS_ALL = `${BASE_URL}/ads/get`

export const GET_ADS_BY_CITY_ID = `${BASE_URL}/ads/get`
export const GET_CITIES_LIST = `${BASE_URL}/ads/get-cities-list`

export const POST_NEW_MODERATOR = `${BASE_URL}/users/admin/moderators/create/`
export const GET_ALL_USERS = `${BASE_URL}/users/admin/moderators/`

export const GET_STATS_MONTH = `${BASE_URL}/users/admin/stats/month/`
export const GET_STATS_WEEK = `${BASE_URL}/users/admin/stats/week/`
export const GET_STATS_DAY = `${BASE_URL}/users/admin/stats/day/`

export const EDIT_AD =  `${BASE_URL}/ads/edit`

