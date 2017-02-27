export const SET_AUTHORIZATION = 'GET AUTHORIZATION';

export function GetAuthorization(isAuthorized) {
	return { type: GET_AUTHORIZATION, authorized: isAuthorized };
}