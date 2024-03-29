import { AxiosError } from 'axios'
import { allProjectDiscussionRoomsRequest } from 'requests/projectDiscussionRoom'
import useSWR from 'swr'
import { ProjectDiscussionRoomMutationResponse } from 'type/mutationResponses'

export const allProjectDiscussionRoomsQuery = (
	isAuthenticated: boolean | null,
	projectId: number | null
) => {
	return useSWR<ProjectDiscussionRoomMutationResponse, AxiosError>(
		isAuthenticated && projectId ? `project-discussion-rooms/project/${projectId}` : null,
		allProjectDiscussionRoomsRequest,
		{
			errorRetryCount: 2,
			revalidateOnFocus: false,
		}
	)
}

export const detailProjectDiscussionRoomQuery = (
	isAuthenticated: boolean | null,
	projectDiscussionRoomId: number | null
) => {
	return useSWR<ProjectDiscussionRoomMutationResponse, AxiosError>(
		isAuthenticated && projectDiscussionRoomId ? `project-discussion-rooms/${projectDiscussionRoomId}` : null,
		allProjectDiscussionRoomsRequest,
		{
			errorRetryCount: 2,
			revalidateOnFocus: false,
		}
	)
}
