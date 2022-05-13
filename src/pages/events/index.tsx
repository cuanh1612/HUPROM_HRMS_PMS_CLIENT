import { Button, useDisclosure } from '@chakra-ui/react'
import Drawer from 'components/Drawer'
import { AuthContext } from 'contexts/AuthContext'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import AddEvent from './add-events'
import UpdateEvent from './update-events'

export interface IEventProps {}

export default function Event({}: IEventProps) {
	const { isAuthenticated, handleLoading } = useContext(AuthContext)
	const router = useRouter()

	//State ---------------------------------------------------------------------
	const [eventIdUpdate, setEventIdUpdate] = useState<number | null>(1)

	//Setup drawer --------------------------------------------------------------
	const { isOpen: isOpenAdd, onOpen: onOpenAdd, onClose: onCloseAdd } = useDisclosure()
	const { isOpen: isOpenUpdate, onOpen: onOpenUpdate, onClose: onCloseUpdate } = useDisclosure()

	//User effect ---------------------------------------------------------------

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

	return (
		<>
			<Button colorScheme="blue" onClick={onOpenAdd}>
				open add event
			</Button>
			<Button colorScheme="blue" onClick={onOpenUpdate}>
				open update event
			</Button>
			<Drawer size="xl" title="Add Event" onClose={onCloseAdd} isOpen={isOpenAdd}>
				<AddEvent onCloseDrawer={onCloseAdd} />
			</Drawer>
			<Drawer size="xl" title="Update Event" onClose={onCloseUpdate} isOpen={isOpenUpdate}>
				<UpdateEvent onCloseDrawer={onCloseUpdate} eventIdUpdate={eventIdUpdate} />
			</Drawer>
		</>
	)
}