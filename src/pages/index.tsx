import {
	Box,
	Button,
	HStack,
	Menu,
	MenuButton,
	MenuList,
	Text,
	useDisclosure,
	VStack,
} from '@chakra-ui/react'
import { Drawer } from 'components/Drawer'
import { ClientLayout } from 'components/layouts'
import NotificationItem from 'components/NotificationItem'
import { AuthContext } from 'contexts/AuthContext'
import { useRouter } from 'next/router'
import { NotificationByCurrentUserQuery } from 'queries/notification'
import { useContext, useEffect } from 'react'
import { AiOutlineBell } from 'react-icons/ai'
import { BsFillBellSlashFill } from 'react-icons/bs'
import { notificationType } from 'type/basicTypes'
import { NextLayout } from 'type/element/layout'
import UpdateClient from './clients/update-clients'
import UpdateEmployees from './employees/update-employees'

const index:NextLayout = ()=> {
	const { isAuthenticated, handleLoading, socket, currentUser } = useContext(AuthContext)
	const { push } = useRouter()

	// set isOpen of dialog to UpdateProfiles
	const {
		isOpen: isOpenUpdateProfile,
		onOpen: onOpenUpdateProfile,
		onClose: onCloseUpdateProfile,
	} = useDisclosure()

	//Query -------------------------------------------------
	const { data: dataNotification, mutate: refetchNotifications } =
		NotificationByCurrentUserQuery(isAuthenticated)

	//Handle check loged in
	useEffect(() => {
		if (isAuthenticated) {
			handleLoading(false)
		} else {
			if (isAuthenticated === false) {
				push('/login')
			}
		}
	}, [isAuthenticated])

	//Handle socket
	useEffect(() => {
		if (socket) {
			socket.on('getNewNotifications', () => {
				refetchNotifications()
			})
		}
	}, [socket])
	return (
		<Box ml={'500px'} mt={'100px'}>
			<Menu placement="bottom-end">
				<MenuButton position={'relative'}>
					<HStack>
						<AiOutlineBell fontSize={20} />
						<Box
							bgColor={'red'}
							color={'white'}
							minH={5}
							minW={5}
							borderRadius={'50%'}
							fontSize={12}
							position={'absolute'}
							left={'2px'}
							top={'-10px'}
						>
							{dataNotification?.notifications?.length
								? dataNotification?.notifications?.length >= 99
									? '+99'
									: dataNotification?.notifications?.length
								: '0'}
						</Box>
					</HStack>
				</MenuButton>
				<MenuList padding={0} borderRadius={0}>
					<Box
						width={'400px'}
						bgColor={'#f2f4f7'}
						minH={'150px'}
						maxH={'290px'}
						overflow={'auto'}
					>
						{dataNotification?.notifications &&
						dataNotification.notifications.length > 0 ? (
							dataNotification.notifications.map((notification: notificationType) => (
								<NotificationItem
									key={notification.id}
									notification={notification}
								/>
							))
						) : (
							<VStack spacing={2} w={'full'} minH={'150px'} justify={'center'}>
								<BsFillBellSlashFill color="#a3aebc" />
								<Text color={'#a3aebc'}>No new notification</Text>
							</VStack>
						)}
					</Box>
				</MenuList>
			</Menu>
			
			{currentUser && (
				<Button colorScheme="blue" onClick={onOpenUpdateProfile}>
					Button
				</Button>
			)}
			{/* drawer to update client */}
			{currentUser && (
				<Drawer
					size="xl"
					title="Update client"
					onClose={onCloseUpdateProfile}
					isOpen={isOpenUpdateProfile}
				>
					{currentUser.role === 'Client' ? (
						<UpdateClient
							onCloseDrawer={onCloseUpdateProfile}
							clientUpdateId={currentUser.id}
						/>
					) : (
						<UpdateEmployees
							onCloseDrawer={onCloseUpdateProfile}
							employeeId={currentUser.id}
						/>
					)}
				</Drawer>
			)}
		</Box>
	)
}
index.getLayout = ClientLayout

export default index
