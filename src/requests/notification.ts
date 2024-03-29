import { NotificationMutationResponse } from 'type/mutationResponses'
import { deleteData, getData } from 'utils/fetchData'

//Function handle get notification by current user
export const notificationByCurrentUserRequest = async (url: string) => {
	return await getData<NotificationMutationResponse>({
		url: `${process.env.NEXT_PUBLIC_API_URL}/api/${url}`,
	})
}

//Handle to delete notification
export const deleteNotificationRequest = async (id: string | number) => {
	return await deleteData<NotificationMutationResponse>({
		url: `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}`,
	})
}
