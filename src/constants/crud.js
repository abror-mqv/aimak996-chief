export const BASE_URL = "http://176.126.164.86:8000"
// export const BASE_URL = "http://127.0.0.1:8000"



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
export const GET_STATS_DAY = `${BASE_URL}/users/admin/stats/today/`

export const EDIT_AD =  `${BASE_URL}/ads/edit`

export const GET_MODERATOR_ADS = `${BASE_URL}/ads/by_moderator/`
export const GET_UNPAID_ADS = `${BASE_URL}/ads/admin/unpaid-ads/`
export const POST_MARK_PAID = `${BASE_URL}/ads/admin/mark-paid/`

// Tinder AI training endpoints
export const GET_TINDER_NEXT = `${BASE_URL}/ai/tinder/next/`
export const POST_TINDER_LABEL = `${BASE_URL}/ai/tinder/confirm/`

// Local model prediction service
// export const PREDICT_BASE_URL = "http://127.0.0.1:8002"
export const PREDICT_BASE_URL = "http://176.126.164.86:8002"

export const POST_PREDICT = `${PREDICT_BASE_URL}/predict`
export const EDIT_CITY = `${BASE_URL}/ads/update-city-info/`


