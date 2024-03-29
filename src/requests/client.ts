import { createClientForm, updateClientForm } from 'type/form/basicFormType'
import { clientMutationResponse, clientProjectStatusMutationResponse } from 'type/mutationResponses'
import { deleteData, getData, postData, putData } from 'utils/fetchData'

//Function handle create client
export async function createClientRequest(inputCreate: createClientForm) {
	const resultFetch = await postData<clientMutationResponse>({
		url: `${process.env.NEXT_PUBLIC_API_URL}/api/clients`,
		body: inputCreate,
	})

	return resultFetch
}

//Function handle create client by import csv
export async function importCSVClientRequest(inputCreate: {clients: createClientForm[]}) {
	const resultFetch = await postData<clientMutationResponse>({
		url: `${process.env.NEXT_PUBLIC_API_URL}/api/clients/csv`,
		body: inputCreate,
	})

	return resultFetch
}


//Function handle update client
export async function updateClientRequest({
	inputeUpdate,
	clientId,
}: {
	inputeUpdate: updateClientForm
	clientId: number
}) {
	const resultFetch = await putData<clientMutationResponse>({
		url: `${process.env.NEXT_PUBLIC_API_URL}/api/clients/${clientId}`,
		body: inputeUpdate,
	})

	return resultFetch
}

//Function handle get all clients
export async function allClientsRequest(url: string) {
	const resultFetch = await getData<clientMutationResponse>({
		url: `${process.env.NEXT_PUBLIC_API_URL}/api/${url}`,
	})

	return resultFetch
}

//Function handle get detail client
export async function detailClientRequest(url: string) {
	const resultFetch = await getData<clientMutationResponse>({
		url: `${process.env.NEXT_PUBLIC_API_URL}/api/${url}`,
	})

	return resultFetch
}

//Function handle get count project status by client
export async function countProjectStatusRequest(url: string) {
	const resultFetch = await getData<clientProjectStatusMutationResponse>({
		url: `${process.env.NEXT_PUBLIC_API_URL}/api/${url}`,
	})

	return resultFetch
}


//Handle to delete client
export const deleteClientRequest = async (id: string) => {
	return await deleteData<clientMutationResponse>({
		url: `${process.env.NEXT_PUBLIC_API_URL}/api/clients/${id}`,
	})
}

// Handle to delete many clients
export const deleteClientsRequest = async (ids: number[]) => {
	return await postData<clientMutationResponse>({
		url: `${process.env.NEXT_PUBLIC_API_URL}/api/clients/delete-many`,
		body: {
			clients: ids,
		},
	})
}

