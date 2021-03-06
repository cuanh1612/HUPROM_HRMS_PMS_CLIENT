import useMutation from 'use-mutation'
import { loginGoogleRequest, loginRequest, logoutRequest, recoverPasswordRequest, reEnterPasswordRequest, registerRequest, resetPasswordRequest } from 'requests/auth'
import { TToast } from 'type/basicTypes'

export const registerMutation = (setToast: TToast) => {
	return useMutation(registerRequest, {
		onFailure({ error }) {
			setToast({
				msg: error.message,
				type: 'error'
			})
		},
	})
}

export const loginMutation = (setToast: TToast) => {
	return useMutation(loginRequest, {
		onFailure({ error }) {
			setToast({
				msg: error.message,
				type: 'error'
			})
		},
	})
}

export const loginGoogleMutation = (setToast: TToast) => {
	return useMutation(loginGoogleRequest, {
		onFailure({ error }) {
			setToast({
				msg: error.message,
				type: 'error'
			})
		},
	})
}

export const logoutServerMutation = (setToast: TToast) => {
	return useMutation(logoutRequest, {
		onFailure({ error }) {
			setToast({
				msg: error.message,
				type: 'error'
			})
		},
	})
}

export const reEnterPasswordMutation = (setToast: TToast) => {
	return useMutation(reEnterPasswordRequest, {
		onFailure({ error }) {
			setToast({
				msg: error.message,
				type: 'error'
			})
		},
	})
}

export const recoverPassMutation = (setToast: TToast) => {
	return useMutation(recoverPasswordRequest, {
		onFailure({ error }) {
			setToast({
				msg: error.message,
				type: 'error'
			})
		},
	})
}

export const resetPassMutation = (setToast: TToast) => {
	return useMutation(resetPasswordRequest, {
		onFailure({ error }) {
			setToast({
				msg: error.message,
				type: 'error'
			})
		},
	})
}



