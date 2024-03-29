import {
	changeRoleRequest,
	createEmployeeRequest,
	deleteEmplRequest,
	deleteEmplsRequest,
	importCSVEmployeeRequest,
	updateEmployeeRequest,
} from 'requests/employee'
import { TToast } from 'type/basicTypes'
import { employeeMutationResponse } from 'type/mutationResponses'
import useMutation from 'use-mutation'

//create
export const createEmployeeMutation = (setToast: TToast) => {
	return useMutation(createEmployeeRequest, {
		onFailure({ error }) {
			setToast({
				msg: error.message,
				type: 'error',
			})
		},
	})
}

//create
export const importCSVEmployeesMutation = (setToast: TToast) => {
	return useMutation(importCSVEmployeeRequest, {
		onFailure({ error }) {
			setToast({
				msg: error.message,
				type: 'error',
			})
		},
	})
}

//update
export const updateEmployeeMutation = (setToast: TToast) => {
	return useMutation(updateEmployeeRequest, {
		onFailure({ error }) {
			setToast({
				msg: error.message,
				type: 'error',
			})
		},
	})
}

// delete one
export const deleteEmployeeMutation = (setToast: TToast) => {
	return useMutation(deleteEmplRequest, {
		onFailure({ error }) {
			setToast({
				msg: error.message,
				type: 'error',
			})
		},
	})
}

// delete many
export const deleteEmployeesMutation = (setToast: TToast) => {
	return useMutation(deleteEmplsRequest, {
		onFailure({ error }) {
			setToast({
				msg: error.message,
				type: 'error',
			})
		},
	})
}

// change role
export const changeRoleMutation = (setToast: TToast) => {
	return useMutation<
		{
			employeeId: number
			role: string
		},
		employeeMutationResponse,
		any
	>(changeRoleRequest, {
		onFailure({ error }) {
			setToast({
				msg: error.message,
				type: 'error',
			})
		},
	})
}
