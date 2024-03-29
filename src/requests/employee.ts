import { createEmployeeForm, updateEmployeeForm } from 'type/form/basicFormType'
import { employeeMutationResponse } from 'type/mutationResponses'
import { deleteData, getData, postData, putData } from 'utils/fetchData'

//Function handle create employee
export async function createEmployeeRequest(inputCreate: createEmployeeForm) {
	const resultFetch = await postData<employeeMutationResponse>({
		url: `${process.env.NEXT_PUBLIC_API_URL}/api/employees`,
		body: inputCreate,
	})

	return resultFetch
}

//Function handle create employee by csv
export async function importCSVEmployeeRequest(inputCreate: {employees: createEmployeeForm[]}) {
	const resultFetch = await postData<employeeMutationResponse>({
		url: `${process.env.NEXT_PUBLIC_API_URL}/api/employees/csv`,
		body: inputCreate,
	})

	return resultFetch
}

//Function handle update employee
export async function updateEmployeeRequest({
	inputUpdate,
	employeeId,
}: {
	inputUpdate: updateEmployeeForm
	employeeId: number
}) {
	const resultFetch = await putData<employeeMutationResponse>({
		url: `${process.env.NEXT_PUBLIC_API_URL}/api/employees/${employeeId}`,
		body: inputUpdate,
	})

	return resultFetch
}

//Function handle get detail employee
export const detailEmployeeRequest = async (url: string) => {
	return await getData<employeeMutationResponse>({
		url: `${process.env.NEXT_PUBLIC_API_URL}/api/${url}`,
	})
}

//Function handle get all employees
export const allEmployeesRequest = async (url: string) => {
	return await getData<employeeMutationResponse>({
		url: `${process.env.NEXT_PUBLIC_API_URL}/api/${url}`,
	})
}

//Handle to delete employee
export const deleteEmplRequest = async (id: string) => {
	return await deleteData<employeeMutationResponse>({
		url: `${process.env.NEXT_PUBLIC_API_URL}/api/employees/${id}`,
	})
}

// Handle to delete many employees
export const deleteEmplsRequest = async (ids: number[]) => {
	return await postData<employeeMutationResponse>({
		url: `${process.env.NEXT_PUBLIC_API_URL}/api/employees/delete-many`,
		body: {
			employees: ids,
		},
	})
}

// change role
export const changeRoleRequest = async ({employeeId, role}: {
	employeeId: number
	role: string
}) => {
	return await putData<employeeMutationResponse>({
		url: `${process.env.NEXT_PUBLIC_API_URL}/api/employees/role`,
		body: {
			employeeId,
			role,
		},
	})
}
