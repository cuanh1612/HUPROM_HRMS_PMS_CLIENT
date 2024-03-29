import {
	Box,
	Button,
	ButtonGroup,
	HStack,
	useColorMode,
	useColorModeValue,
	useDisclosure,
	VStack,
	Avatar,
	Text,
} from '@chakra-ui/react'
import { EventInput } from '@fullcalendar/common'
import { Calendar } from '@fullcalendar/core'
import interactionPlugin from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import timeGridPlugin from '@fullcalendar/timegrid'
import { ClientLayout } from 'components/layouts'
import { AuthContext } from 'contexts/AuthContext'
import { useRouter } from 'next/router'
import {
	allClientsNormalQuery,
	allEmployeesNormalQuery,
	allProjectsNormalQuery,
	timeLogsCalendarByEmployeeQuery,
	timeLogsCalendarQuery,
} from 'queries'
import React, { useContext, useEffect, useState } from 'react'
import { NextLayout } from 'type/element/layout'
import { AlertDialog, ButtonIcon, Func, FuncCollapse, Head } from 'components/common'
import { MdOutlineNavigateBefore, MdOutlineNavigateNext } from 'react-icons/md'
import AddTimeLog from './add-time-logs'
import { Drawer } from 'components/Drawer'
import DetailTimeLog from './[timeLogId]'
import UpdateTimeLog from './[timeLogId]/update-time-logs'
import { deleteTimeLogMutation } from 'mutations'
import { Select, SelectCustom } from 'components/filter'
import { IFilter } from 'type/tableTypes'
import { IOption } from 'type/basicTypes'

import { IoAdd } from 'react-icons/io5'
import { VscFilter } from 'react-icons/vsc'
import { BsCalendar2Day, BsCalendar2Month, BsCalendar2Week } from 'react-icons/bs'

const calendar: NextLayout = () => {
	const { isAuthenticated, handleLoading, setToast, currentUser } = useContext(AuthContext)
	const router = useRouter()
	const { colorMode } = useColorMode()

	// style
	const dayHeader = useColorModeValue('dayHeader', 'dayHeader--dark')

	// state
	// set id time log to delete or update
	const [idTimeLog, setIdTimeLog] = useState<number>(16)

	// set data to handle to calendar
	const [data, setData] = useState<EventInput[]>([])
	const [calendar, setCalendar] = useState<Calendar>()

	// set employees to filter
	const [employeesFilter, setEmplsFilter] = useState<IOption[]>([])
	//  set clients to filter
	const [clientsFilter, setClientsFilter] = useState<IOption[]>([])

	// filter
	const [filter, setFilter] = useState<{
		employee?: number
		project?: number
		client?: number
	}>()

	// query ------------------------------------------------------------------------------------------
	// get all time logs to show in calendar
	const { data: allTimeLogs, mutate: refetchTimeLogs } =
		currentUser?.role === 'Admin'
			? timeLogsCalendarQuery({
					isAuthenticated,
					...filter,
			  })
			: timeLogsCalendarByEmployeeQuery({
					isAuthenticated,
					employeeId: currentUser?.id,
					...filter,
			  })

	// get all projects to filter
	const { data: dataAllProjects } = allProjectsNormalQuery(isAuthenticated)

	// get all employees to filter
	const { data: allEmployees } = allEmployeesNormalQuery(isAuthenticated)
	// get all clients to filter
	const { data: allClients } = allClientsNormalQuery(isAuthenticated)

	// mutation
	// delete one
	const [deleteOne, { data: dataDlOne, status: statusDlOne }] = deleteTimeLogMutation(setToast)

	//Modal -------------------------------------------------------------
	// set open add time log
	const {
		isOpen: isOpenAddTimeLog,
		onOpen: onOpenAddTimeLog,
		onClose: onCloseAddTimeLog,
	} = useDisclosure()

	// set open detail time log
	const {
		isOpen: isOpenDetailTimelog,
		onOpen: onOpenDetailTimelog,
		onClose: onCloseDetailTimelog,
	} = useDisclosure()

	// set open update time log
	const {
		isOpen: isOpenUpdateTimelog,
		onOpen: onOpenUpdateTimelog,
		onClose: onCloseUpdateTimelog,
	} = useDisclosure()

	// set isOpen of dialog to delete one
	const { isOpen: isOpenDialogDl, onOpen: onOpenDl, onClose: onCloseDl } = useDisclosure()

	// set isOpen of drawer to filters
	const { isOpen: isOpenFilter, onOpen: onOpenFilter, onClose: onCloseFilter } = useDisclosure()

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

	useEffect(() => {
		if (allTimeLogs) {
			const newData = allTimeLogs.timeLogs?.map((item): EventInput => {
				return {
					title: item.task?.name,
					id: `${item.id}`,
					backgroundColor: `${item?.task?.status?.color}${
						colorMode == 'light' ? '30' : ''
					}`,
					textColor: colorMode != 'light' ? 'white' : item?.task?.status?.color,
					start: new Date(`${item.starts_on_date} ${item.starts_on_time}`),
					end: new Date(`${item.ends_on_date} ${item.ends_on_time}`),
					borderColor: `${item?.task?.status?.color}`,
				}
			})
			setData(newData || [])
		}
	}, [allTimeLogs, colorMode])

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
			calendar.render()

			calendar.on('eventClick', (info) => {
				setIdTimeLog(Number(info.event.id))
				onOpenDetailTimelog()
			})
		}
	}, [calendar])

	// check is successfully delete one
	useEffect(() => {
		if (statusDlOne == 'success' && dataDlOne) {
			setToast({
				msg: dataDlOne.message,
				type: statusDlOne,
			})
			refetchTimeLogs()
		}
	}, [statusDlOne])

	// set employee to filter
	useEffect(() => {
		if (allEmployees?.employees) {
			const valuesFilter = allEmployees.employees.map(
				(employee): IOption => ({
					label: (
						<>
							<HStack>
								<Avatar
									size={'xs'}
									name={employee.name}
									src={employee.avatar?.url}
								/>
								<Text color={colorMode == 'dark' ? 'white' : 'black'}>
									{employee.name}
								</Text>
							</HStack>
						</>
					),
					value: String(employee.id),
				})
			)
			setEmplsFilter(valuesFilter)
		}
	}, [allEmployees, colorMode])

	// set employee to filter
	useEffect(() => {
		if (allClients?.clients) {
			const valuesFilter = allClients.clients.map(
				(client): IOption => ({
					label: (
						<>
							<HStack>
								<Avatar size={'xs'} name={client.name} src={client.avatar?.url} />
								<Text color={colorMode == 'dark' ? 'white' : 'black'}>
									{client.name}
								</Text>
							</HStack>
						</>
					),
					value: String(client.id),
				})
			)
			setClientsFilter(valuesFilter)
		}
	}, [allClients, colorMode])

	return (
		<Box w={'full'} pb={8}>
			<Head title="Time logs calendar" />
			<FuncCollapse>
				{currentUser && currentUser.role === 'Admin' && (
					<>
						<Func
							icon={<IoAdd />}
							description={'Add new job by form'}
							title={'Add new'}
							action={onOpenAddTimeLog}
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
			{/* drawer to add project time log */}
			<Drawer
				size="xl"
				title="Add Time Log"
				onClose={onCloseAddTimeLog}
				isOpen={isOpenAddTimeLog}
			>
				<AddTimeLog onCloseDrawer={onCloseAddTimeLog} />
			</Drawer>

			{/* drawer to show detail project time log */}
			<Drawer
				size="xl"
				title="Detail Time Log"
				onClose={onCloseDetailTimelog}
				isOpen={isOpenDetailTimelog}
			>
				<DetailTimeLog
					onOpenDl={() => {
						onOpenDl()
					}}
					onOpenUpdate={() => {
						onCloseDetailTimelog()
						onOpenUpdateTimelog()
					}}
					timeLogIdProp={idTimeLog}
				/>
			</Drawer>

			{/* drawer to update project time log */}
			<Drawer
				size="xl"
				title="Update Time Log"
				onClose={onCloseUpdateTimelog}
				isOpen={isOpenUpdateTimelog}
			>
				<UpdateTimeLog onCloseDrawer={onCloseUpdateTimelog} timeLogIdProp={idTimeLog} />
			</Drawer>

			{/* alert dialog when delete one */}
			<AlertDialog
				handleDelete={() => {
					deleteOne(String(idTimeLog))
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
							setFilter(undefined)
						}}
					>
						Reset
					</Button>
				}
				isOpen={isOpenFilter}
				size={'xs'}
				title={'Filter'}
				onClose={onCloseFilter}
			>
				<VStack p={6} spacing={5}>
					<Select
						options={dataAllProjects?.projects?.map((project) => ({
							label: project.name,
							value: project.id,
						}))}
						handleSearch={(data: IFilter) => {
							setFilter((state) => ({
								...state,
								project: data.filterValue,
							}))
						}}
						columnId={'project'}
						label="Project"
						placeholder="Select project"
					/>

					{currentUser?.role === 'Admin' && (
						<SelectCustom
							placeholder="Select employee"
							handleSearch={(field: any) => {
								setFilter((state) => ({
									...state,
									employee: Number(field.value),
								}))
							}}
							label={'Employee'}
							name={'employee'}
							options={[
								{
									label: (
										<Text color={colorMode == 'light' ? 'black' : 'white'}>
											all
										</Text>
									),
									value: '',
								},

								...employeesFilter,
							]}
							required={false}
						/>
					)}
					<SelectCustom
						placeholder="Select client"
						handleSearch={(field: any) => {
							setFilter((state) => ({
								...state,
								client: Number(field.value),
							}))
						}}
						label={'Client'}
						name={'client'}
						options={[
							{
								label: (
									<Text color={colorMode == 'light' ? 'black' : 'white'}>
										all
									</Text>
								),
								value: '',
							},

							...clientsFilter,
						]}
						required={false}
					/>
				</VStack>
			</Drawer>
		</Box>
	)
}

calendar.getLayout = ClientLayout
export default calendar
