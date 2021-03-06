import { createEventRequest, deleteEventRequest, updateEventRequest } from 'requests/event'
import { TToast } from 'type/basicTypes'
import useMutation from 'use-mutation'

//create
export const createEventMutation = (setToast: TToast) => {
	return useMutation(createEventRequest, {
		onFailure({ error }) {
			setToast({
				msg: error.message,
				type: 'error',
			})
		},
	})
}

//update
export const updateEventMutation = (setToast: TToast) => {
	return useMutation(updateEventRequest, {
		onFailure({ error }) {
			setToast({
				msg: error.message,
				type: 'error',
			})
		},
	})
}

// delete one
export const deleteEventMutation = (setToast: TToast) => {
	return useMutation(deleteEventRequest, {
		onFailure({ error }) {
			setToast({
				msg: error.message,
				type: 'error',
			})
		},
	})
}