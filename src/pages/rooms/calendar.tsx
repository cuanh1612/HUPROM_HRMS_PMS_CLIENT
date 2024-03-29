import {
	Box,
	Button,
	ButtonGroup,
	HStack,
	Text,
	useColorMode,
	useColorModeValue,
	useDisclosure,
	VStack,
} from '@chakra-ui/react'
import { EventInput } from '@fullcalendar/common'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import timeGridPlugin from '@fullcalendar/timegrid'
import { AlertDialog, ButtonIcon, Func, FuncCollapse, Head } from 'components/common'
import { Drawer } from 'components/Drawer'
import { Select } from 'components/filter'
import { ClientLayout } from 'components/layouts'
import { AuthContext } from 'contexts/AuthContext'
import { deleteRoomMutation } from 'mutations'
import { useRouter } from 'next/router'
import { allRoomsQuery } from 'queries'
import { useContext, useEffect, useState } from 'react'
import { BsCalendar2Day, BsCalendar2Month, BsCalendar2Week } from 'react-icons/bs'
import { IoAdd } from 'react-icons/io5'
import { MdOutlineNavigateBefore, MdOutlineNavigateNext } from 'react-icons/md'
import { VscFilter } from 'react-icons/vsc'
import { roomType } from 'type/basicTypes'
import { NextLayout } from 'type/element/layout'
import { IFilter } from 'type/tableTypes'
import AddRooms from './add-rooms'
import DetailRoom from './[roomId]'
import UpdateRoom from './[roomId]/update-room'

const calendar: NextLayout = () => {
	const { isAuthenticated, handleLoading, currentUser, setToast } = useContext(AuthContext)
	const router = useRouter()
	const { colorMode } = useColorMode()
	// style
	const dayHeader = useColorModeValue('dayHeader', 'dayHeader--dark')

	const [data, setData] = useState<EventInput[]>([])
	const [calendar, setCalendar] = useState<Calendar>()
	const [roomId, setRoomId] = useState<string | number>()

	const [filter, setFilter] = useState<{
		month?: number | string
		year?: number | string
	}>({})

	// set isOpen of drawer to filters
	const { isOpen: isOpenFilter, onOpen: onOpenFilter, onClose: onCloseFilter } = useDisclosure()
	//Setup modal ----------------------------------------------------------------
	const {
		isOpen: isOpenCreRoom,
		onOpen: onOpenCreRoom,
		onClose: onCloseCreRoom,
	} = useDisclosure()

	// set isOpen of dialog to delete one
	const { isOpen: isOpenDialogDl, onOpen: onOpenDl, onClose: onCloseDl } = useDisclosure()
	const { isOpen: isOpenUpRoom, onOpen: onOpenUpRoom, onClose: onCloseUpRoom } = useDisclosure()
	const {
		isOpen: isOpenDetailRoom,
		onOpen: onOpenDetailRoom,
		onClose: onCloseDetailRoom,
	} = useDisclosure()

	// query
	const { data: dataRooms, mutate: refetchAllRooms } = allRoomsQuery({
		isAuthenticated,
		role: currentUser?.role,
		id: currentUser?.id,
		...filter,
	})

	// mutation
	const [deleteRoom, { data: dataDl, status: statusDl }] = deleteRoomMutation(setToast)

	//useEffect ---------------------------------------------------------
	//Handle check logged in
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
		const handleData = (rooms: roomType[]): EventInput[] => {
			return rooms.map((room): EventInput => {
				return {
					title: room.title,
					id: `${room.id}`,
					backgroundColor: `#B0E4DD`,
					textColor: '#008774',
					borderColor: `#008774`,
					start: new Date(`${room.date} ${room.start_time}`),
					end: new Date(`${room.date} 23:59:00`),
				}
			})
		}
		if (dataRooms) {
			const rooms = dataRooms.rooms && handleData(dataRooms.rooms)
			const otherRooms = dataRooms.other_rooms && handleData(dataRooms.other_rooms)
			if (otherRooms && rooms) {
				setData([...otherRooms, ...rooms])
			}
		}
	}, [dataRooms, colorMode])

	// set calendar
	useEffect(() => {
		setCalendar(
			new Calendar(document.getElementById('calendar') as HTMLElement, {
				plugins: [interactionPlugin, dayGridPlugin, listPlugin, timeGridPlugin],
				events: data,
				editable: false,
				selectable: true,
				headerToolbar: {
					center: undefined,
					right: undefined,
					left: 'title',
				},
				dayCellClassNames: 'dayCell',
				viewClassNames: 'view',
				eventClassNames: 'event',
				allDayClassNames: 'allDay',
				dayHeaderClassNames: dayHeader,
				moreLinkClassNames: 'moreLink',
				noEventsClassNames: 'noEvent',
				slotLaneClassNames: 'slotLane',
				slotLabelClassNames: 'slotLabel',
				weekNumberClassNames: 'weekNumber',
				nowIndicatorClassNames: 'nowIndicator',
			})
		)
	}, [data, colorMode])

	useEffect(() => {
		if (calendar) {
			if (filter) {
				let date = new Date()
				if (filter.month) {
					date = new Date(date.setMonth(Number(filter.month) - 1))
				}
				if (filter.year) {
					date = new Date(date.setFullYear(Number(filter.year)))
				}
				calendar.gotoDate(date)
			}
			calendar.render()
			calendar.on('eventClick', (info) => {
				setRoomId(Number(info.event.id))
				onOpenDetailRoom()
			})
		}
	}, [calendar, filter])

	useEffect(() => {
		if (statusDl == 'success' && dataDl) {
			setToast({
				msg: dataDl.message,
				type: statusDl,
			})
			refetchAllRooms()
		}
	}, [statusDl])

	return (
		<Box pb={8}>
			<Head title={'Rooms calendar'} />
			<Box className="function">
				<FuncCollapse>
					{currentUser && currentUser.role === 'Admin' && (
						<>
							<Func
								icon={<IoAdd />}
								description={'Add new job by form'}
								title={'Add new'}
								action={onOpenCreRoom}
							/>
						</>
					)}
					<Func
						icon={<VscFilter />}
						description={'Open draw to filter'}
						title={'filter'}
						action={onOpenFilter}
					/>
					<Func
						icon={<BsCalendar2Day />}
						description={'Show calendar by day'}
						title={'Day'}
						action={() => {
							calendar?.changeView('timeGridDay')
						}}
					/>
					<Func
						icon={<BsCalendar2Week />}
						description={'Show calendar by week'}
						title={'Week'}
						action={() => calendar?.changeView('timeGridWeek')}
					/>
					<Func
						icon={<BsCalendar2Month />}
						description={'Show calendar by month'}
						title={'Month'}
						action={() => calendar?.changeView('dayGridMonth')}
					/>
				</FuncCollapse>
			</Box>
			<HStack pb={4} justifyContent={'space-between'}>
				<Text color={'gray.500'} fontWeight={'semibold'}>
					Calendar
				</Text>
				<ButtonGroup spacing={4}>
					<ButtonIcon
						handle={() => calendar?.prev()}
						ariaLabel={'first page'}
						icon={<MdOutlineNavigateBefore />}
					/>
					<Button
						color={'white'}
						bg={'hu-Green.normal'}
						onClick={() => calendar?.today()}
					>
						today
					</Button>
					<ButtonIcon
						handle={() => calendar?.next()}
						ariaLabel={'next page'}
						icon={<MdOutlineNavigateNext />}
					/>
				</ButtonGroup>
			</HStack>
			<Box id={'calendar'} />
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
			<Drawer
				footer={
					<Button
						onClick={() => {
							setFilter({
								month: undefined,
								year: undefined,
							})
						}}
					>
						reset
					</Button>
				}
				isOpen={isOpenFilter}
				size={'xs'}
				title={'Filter'}
				onClose={onCloseFilter}
			>
				<VStack spacing={5} p={6}>
					<Select
						options={[
							{
								label: 'January',
								value: 1,
							},
							{
								label: 'February',
								value: 2,
							},
							{
								label: 'March',
								value: 3,
							},
							{
								label: 'April',
								value: 4,
							},
							{
								label: 'May',
								value: 5,
							},
							{
								label: 'June',
								value: 6,
							},
							{
								label: 'July',
								value: 7,
							},
							{
								label: 'August',
								value: 8,
							},
							{
								label: 'September',
								value: 9,
							},
							{
								label: 'October',
								value: 10,
							},
							{
								label: 'November',
								value: 11,
							},
							{
								label: 'December',
								value: 12,
							},
						]}
						handleSearch={(data: IFilter) => {
							setFilter((state) => ({
								...state,
								month: data.filterValue,
							}))
						}}
						columnId={'day'}
						label="Month"
						placeholder="Select month"
					/>

					<Select
						options={[
							{
								label: `${new Date().getFullYear()}`,
								value: `${new Date().getFullYear()}`,
							},
							{
								label: `${new Date().getFullYear() - 1}`,
								value: `${new Date().getFullYear() - 1}`,
							},
							{
								label: `${new Date().getFullYear() - 2}`,
								value: `${new Date().getFullYear() - 2}`,
							},
							{
								label: `${new Date().getFullYear() - 3}`,
								value: `${new Date().getFullYear() - 3}`,
							},
							{
								label: `${new Date().getFullYear() - 4}`,
								value: `${new Date().getFullYear() - 4}`,
							},
						]}
						handleSearch={(data: IFilter) => {
							setFilter((state) => ({
								...state,
								year: data.filterValue,
							}))
						}}
						columnId={'holiday_date'}
						label="Year"
						placeholder="Select year"
					/>
				</VStack>
			</Drawer>
			<Drawer
				size="md"
				title="Detail Room"
				onClose={onCloseDetailRoom}
				isOpen={isOpenDetailRoom}
			>
				<DetailRoom
					onOpenUpdate={() => {
						onOpenUpRoom()
					}}
					onCloseDetailRoom={onCloseDetailRoom}
					onOpenDl={() => {
						onOpenDl()
					}}
					roomIdProp={roomId}
				/>
			</Drawer>
		</Box>
	)
}

calendar.getLayout = ClientLayout

export default calendar
