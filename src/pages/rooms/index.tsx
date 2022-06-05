import { Box, Button, Text, useDisclosure, VStack } from '@chakra-ui/react'
import { AlertDialog } from 'components/common'
import { Drawer } from 'components/Drawer'
import { ClientLayout } from 'components/layouts'
import { Cards } from 'components/room'
import { AuthContext } from 'contexts/AuthContext'
import { deleteRoomMutation } from 'mutations'
import { useRouter } from 'next/router'
import { allRoomsQuery } from 'queries'
import React, { useCallback, useContext, useEffect, useState } from 'react'

import { NextLayout } from 'type/element/layout'
import AddRooms from './add-rooms'
import UpdateRoom from './[roomId]/update-room'

const zoom: NextLayout = () => {
	const { isAuthenticated, handleLoading, currentUser, setToast } = useContext(AuthContext)
	const router = useRouter()

	//State ---------------------------------------------------------------------
	const [roomId, setRoomId] = useState<string | number>(7)

	//Setup modal ----------------------------------------------------------------
	const {
		isOpen: isOpenCreRoom,
		onOpen: onOpenCreRoom,
		onClose: onCloseCreRoom,
	} = useDisclosure()

	// set isOpen of dialog to delete one
	const { isOpen: isOpenDialogDl, onOpen: onOpenDl, onClose: onCloseDl } = useDisclosure()
	const { isOpen: isOpenUpRoom, onOpen: onOpenUpRoom, onClose: onCloseUpRoom } = useDisclosure()

	// query
	const { data: dataRooms, mutate: refetchAllRooms } = allRoomsQuery({
		isAuthenticated,
		role: currentUser?.role,
		id: currentUser?.id,
	})

	// mutation
	const [deleteRoom, { data: dataDl, status: statusDl }] = deleteRoomMutation(setToast)

	//Useeffect ---------------------------------------------------------
	//Handle check loged in
	useEffect(() => {
		if (isAuthenticated) {
			handleLoading(false)
		} else {
			if (isAuthenticated === false) {
				router.push('/login')
			}
		}
	}, [isAuthenticated])

	useEffect(() => {
		if (statusDl == 'success' && dataDl) {
			setToast({
				msg: dataDl.message,
				type: 'success',
			})
			refetchAllRooms()
		}
	}, [statusDl])

	// show alert when delete
	const showAlertDl = useCallback((id: number) => {
		setRoomId(id)
		onOpenDl()
	}, [])

	// show update
	const showUpdate = useCallback((id: number) => {
		setRoomId(id)
		onOpenUpRoom()
	}, [])
	return (
		<VStack alignItems={'start'} w={'full'} spacing={5}>
			<Box>
				<Button mb={5} onClick={onOpenCreRoom}>
					create room
				</Button>
				<Button mb={5} onClick={onOpenUpRoom}>
					update room
				</Button>
			</Box>
			<VStack w={'full'}>
				<Text w={'full'} fontWeight={'bold'} fontSize={'xl'}>
					Your rooms:
				</Text>
				{dataRooms?.rooms && <Cards showAlertDl={showAlertDl} showUpdate={showUpdate} data={dataRooms.rooms} />}
			</VStack>

			<VStack w={'full'}>
				<Text w={'full'} fontWeight={'bold'} fontSize={'xl'}>
					another rooms:
				</Text>
				{dataRooms?.another_rooms && <Cards data={dataRooms.another_rooms} />}
			</VStack>

			<Drawer size="xl" title="Add Room" onClose={onCloseCreRoom} isOpen={isOpenCreRoom}>
				<AddRooms onCloseDrawer={onCloseCreRoom} />
			</Drawer>

			<Drawer size="xl" title="Update Room" onClose={onCloseUpRoom} isOpen={isOpenUpRoom}>
				<UpdateRoom onCloseDrawer={onCloseUpRoom} roomId={roomId} />
			</Drawer>

			{/* alert dialog when delete one */}
			<AlertDialog
				handleDelete={() => {
					deleteRoom(String(roomId))
				}}
				title="Are you sure?"
				content="You will not be able to recover the deleted record!"
				isOpen={isOpenDialogDl}
				onClose={onCloseDl}
			/>
		</VStack>
	)
}

zoom.getLayout = ClientLayout
export default zoom
