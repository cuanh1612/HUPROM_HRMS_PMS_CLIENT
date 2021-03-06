import { createContractFileForm } from 'type/form/basicFormType'
import { contractFileMutaionResponse } from 'type/mutationResponses'
import { deleteData, getData, postData } from 'utils/fetchData'

//Function handle create contract file
export async function createContractFileRequest(inputCreate: createContractFileForm) {
	const resultFetch = await postData<contractFileMutaionResponse>({
		url: `${process.env.NEXT_PUBLIC_API_URL}/api/contract-files`,
		body: inputCreate,
	})

	return resultFetch
}

//Function handle delete contract file
export async function deleteContractFileRequest(inputDelete: {
	contractFileId: number
	contractId: number
}) {
	const resultFetch = await deleteData<contractFileMutaionResponse>({
		url: `${process.env.NEXT_PUBLIC_API_URL}/api/contract-files/${inputDelete.contractFileId}/contract/${inputDelete.contractId}`,
	})

	return resultFetch
}

//Function handle get all contract file
export const allContractFilesRequest = async (url: string) => {
	return await getData<contractFileMutaionResponse>({
		url: `${process.env.NEXT_PUBLIC_API_URL}/api/${url}`,
	})
}
