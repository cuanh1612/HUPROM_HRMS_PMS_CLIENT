import { AxiosError } from 'axios'
import { allProjectDiscussionRoomsRequest } from 'requests/projectDiscussionRoom'
import useSWR from 'swr'
import { ProjectDisucssionRoomMutaionResponse } from 'type/mutationResponses'

export const allProjectDiscussionRoomsQuery = (
	isAuthenticated: boolean | null,
	projectId: number | null
) => {
	return useSWR<ProjectDisucssionRoomMutaionResponse, AxiosError>(
		isAuthenticated && projectId ? `project-discussion-rooms/project/${projectId}` : null,
		allProjectDiscussionRoomsRequest,
		{
			errorRetryCount: 2,
			revalidateOnFocus: false,
		}
	)
}
