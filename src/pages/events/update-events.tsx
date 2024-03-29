import { Avatar, Box, Button, Grid, GridItem, HStack, Text, VStack } from '@chakra-ui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import { Input, SelectMany, TimePicker } from 'components/form'
import { Editor, Loading } from 'components/common'
import { AuthContext } from 'contexts/AuthContext'
import { updateEventMutation } from 'mutations'
import { allClientsQuery, allEmployeesNormalQuery, allEventsQuery, detailEventQuery } from 'queries'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { AiOutlineBgColors, AiOutlineCheck } from 'react-icons/ai'
import { BsCalendarDate } from 'react-icons/bs'
import { MdOutlineDriveFileRenameOutline, MdPlace } from 'react-icons/md'
import { IOption } from 'type/basicTypes'
import { updateEventForm } from 'type/form/basicFormType'
import { updateEventValidate } from 'utils/validate'

export interface IUpdateEventProps {
	onCloseDrawer?: () => void
	eventIdUpdate: number | null
}

export default function UpdateEvent({ onCloseDrawer, eventIdUpdate }: IUpdateEventProps) {
	const { isAuthenticated, setToast, socket } = useContext(AuthContext)

	//State ----------------------------------------------------------------------
	const [description, setDescription] = useState<string>('')
	const [optionEmployees, setOptionEmployees] = useState<IOption[]>([])
	const [optionClients, setOptionClients] = useState<IOption[]>([])
	const [selectedOptionEmployees, setSelectedOptionEmployees] = useState<IOption[]>([])
	const [selectedOptionClients, setSelectedOptionClients] = useState<IOption[]>([])

	//Query ----------------------------------------------------------------------
	const { data: dataDetailEvent } = detailEventQuery(isAuthenticated, eventIdUpdate)

	// get all employees
	const { data: allEmployees } = allEmployeesNormalQuery(isAuthenticated)

	// refetch all event
	const { mutate: refetchAllEvents } = allEventsQuery(isAuthenticated)

	// get all clients
	const { data: allClients } = allClientsQuery(isAuthenticated)

	//mutation -------------------------------------------------------------------
	const [mutateUpEvent, { status: statusUpEvent, data: dataUpEvent }] =
		updateEventMutation(setToast)

	// setForm and submit form create new contract -------------------------------
	const formSetting = useForm<updateEventForm>({
		defaultValues: {
			name: '',
			color: '#FF0000',
			where: '',
			starts_on_date: undefined,
			ends_on_date: undefined,
			employeeEmails: [],
			clientEmails: [],
			typeRepeat: undefined,
			starts_on_time: '',
			ends_on_time: '',
		},
		resolver: yupResolver(updateEventValidate),
	})

	const { handleSubmit } = formSetting

	//Onsubmit handle update event
	const onSubmit = async (values: updateEventForm) => {
		if (!description) {
			setToast({
				msg: 'Please enter field description',
				type: 'warning',
			})
		} else {
			if (eventIdUpdate) {
				await mutateUpEvent({
					eventId: eventIdUpdate,
					inputUpdate: {
						...values,
					},
				})
			} else {
				setToast({
					msg: 'Not found event to update',
					type: 'warning',
				})
			}
		}
	}

	//Set data option employees state
	useEffect(() => {
		if (allEmployees && allEmployees.employees) {
			const newOptionEmployees: IOption[] = []

			allEmployees.employees.map((employee) => {
				newOptionEmployees.push({
					label: (
						<>
							<HStack>
								<Avatar
									size={'xs'}
									name={employee.name}
									src={employee.avatar?.url}
								/>
								<Text>{employee.email}</Text>
							</HStack>
						</>
					),
					value: employee.email,
				})
			})

			setOptionEmployees(newOptionEmployees)
		}
	}, [allEmployees])

	//Set data option clients state
	useEffect(() => {
		if (allClients && allClients.clients) {
			const newOptionClients: IOption[] = []

			allClients.clients.map((client) => {
				newOptionClients.push({
					label: (
						<>
							<HStack>
								<Avatar size={'xs'} name={client.name} src={client.avatar?.url} />
								<Text>{client.email}</Text>
							</HStack>
						</>
					),
					value: client.email,
				})
			})

			setOptionClients(newOptionClients)
		}
	}, [allClients])

	//Note when request success
	useEffect(() => {
		if (statusUpEvent === 'success') {
			//Close drawer when using drawer
			if (onCloseDrawer) {
				onCloseDrawer()
			}

			setToast({
				type: statusUpEvent,
				msg: dataUpEvent?.message as string,
			})
			refetchAllEvents()

			if (socket) {
				socket.emit('newEvent')
			}
		}
	}, [statusUpEvent])

	//change data form when have data detail event
	useEffect(() => {
		if (dataDetailEvent && dataDetailEvent.event) {
			//Set data selected option employee
			if (dataDetailEvent.event.employees) {
				const newSelectedOptionEmployees: IOption[] = []

				dataDetailEvent.event.employees.map((employee) => {
					newSelectedOptionEmployees.push({
						label: (
							<>
								<HStack>
									<Avatar
										size={'xs'}
										name={employee.name}
										src={employee.avatar?.url}
									/>
									<Text>{employee.email}</Text>
								</HStack>
							</>
						),
						value: employee.email,
					})
				})

				setSelectedOptionEmployees(newSelectedOptionEmployees)
			}

			//Set data selected option clients
			if (dataDetailEvent.event.clients) {
				const newSelectedOptionClients: IOption[] = []

				dataDetailEvent.event.clients.map((client) => {
					newSelectedOptionClients.push({
						label: (
							<>
								<HStack>
									<Avatar
										size={'xs'}
										name={client.name}
										src={client.avatar?.url}
									/>
									<Text>{client.email}</Text>
								</HStack>
							</>
						),
						value: client.email,
					})
				})

				setSelectedOptionClients(newSelectedOptionClients)
			}

			if (allClients && allClients.clients) {
				const newOptionClients: IOption[] = []

				allClients.clients.map((client) => {
					newOptionClients.push({
						label: (
							<>
								<HStack>
									<Avatar
										size={'xs'}
										name={client.name}
										src={client.avatar?.url}
									/>
									<Text>{client.email}</Text>
								</HStack>
							</>
						),
						value: client.email,
					})
				})

				setOptionClients(newOptionClients)
			}

			//Set date description
			setDescription(dataDetailEvent.event.description)

			//set data form
			formSetting.reset({
				name: dataDetailEvent.event.name,
				color: dataDetailEvent.event.color,
				where: dataDetailEvent.event.where,
				starts_on_date: dataDetailEvent.event.starts_on_date,
				ends_on_date: dataDetailEvent.event.ends_on_date,
				employeeEmails:
					dataDetailEvent.event.employees?.map((employee) => employee.email) || [],
				clientEmails: dataDetailEvent.event.clients?.map((client) => client.email) || [],
				starts_on_time: dataDetailEvent.event.starts_on_time,
				ends_on_time: dataDetailEvent.event.ends_on_time,
			})
		}
	}, [dataDetailEvent])

	useEffect(() => {}, [formSetting])

	//Function -------------------------------------------------------------------
	const onChangeDescription = (value: string) => {
		setDescription(value)
	}

	return (
		<>
			<Box pos="relative" p={6} as={'form'} h="auto" onSubmit={handleSubmit(onSubmit)}>
				<Grid templateColumns="repeat(2, 1fr)" gap={6}>
					<GridItem w="100%" colSpan={[2, 1]}>
						<Input
							name="name"
							label="Event Name"
							icon={
								<MdOutlineDriveFileRenameOutline
									fontSize={'20px'}
									color="gray"
									opacity={0.6}
								/>
							}
							form={formSetting}
							placeholder="Enter Event Name"
							type="text"
							required
						/>
					</GridItem>

					<GridItem w="100%" colSpan={[2, 1]}>
						<Input
							name="color"
							label="Label Color"
							icon={
								<AiOutlineBgColors fontSize={'20px'} color="gray" opacity={0.6} />
							}
							form={formSetting}
							type="color"
							required
						/>
					</GridItem>

					<GridItem w="100%" colSpan={[2, 1]}>
						<Input
							name="where"
							label="Where"
							icon={<MdPlace fontSize={'20px'} color="gray" opacity={0.6} />}
							form={formSetting}
							type="text"
							placeholder="Enter Event place"
							required
						/>
					</GridItem>

					<GridItem w="100%" colSpan={2}>
						<VStack align={'start'}>
							<Text fontWeight={'normal'} color={'gray.400'}>
								Description
							</Text>
							<Editor note={description} onChangeNote={onChangeDescription} />
						</VStack>
					</GridItem>

					<GridItem w="100%" colSpan={[2, 1]}>
						<Input
							name="starts_on_date"
							label="Start On Date"
							icon={<BsCalendarDate fontSize={'20px'} color="gray" opacity={0.6} />}
							form={formSetting}
							type="date"
							required
						/>
					</GridItem>

					<GridItem w="100%" colSpan={[2, 1]}>
						<TimePicker
							form={formSetting}
							name={'starts_on_time'}
							label={'Starts On Time'}
							required
							timeInit={formSetting.getValues()['starts_on_time']}
						/>
					</GridItem>

					<GridItem w="100%" colSpan={[2, 1]}>
						<Input
							name="ends_on_date"
							label="Ends On Date"
							icon={<BsCalendarDate fontSize={'20px'} color="gray" opacity={0.6} />}
							form={formSetting}
							type="date"
							required
						/>
					</GridItem>

					<GridItem w="100%" colSpan={[2, 1]}>
						<TimePicker
							form={formSetting}
							name={'ends_on_time'}
							label={'Ends On Time'}
							required
							timeInit={formSetting.getValues()['ends_on_time']}
						/>
					</GridItem>

					<GridItem w="100%" colSpan={[2]}>
						<SelectMany
							placeholder="Select employees"
							form={formSetting}
							label={'Employee'}
							name={'employeeEmails'}
							required={true}
							options={optionEmployees}
							defaultValues={formSetting.getValues('employeeEmails')}
							selectedOptions={selectedOptionEmployees}
						/>
					</GridItem>

					<GridItem w="100%" colSpan={[2]}>
						<SelectMany
							placeholder='Select clients'
							form={formSetting}
							label={'Client'}
							name={'clientEmails'}
							required={true}
							options={optionClients}
							selectedOptions={selectedOptionClients}
						/>
					</GridItem>
				</Grid>

				<Button
					color={'white'}
					bg={'hu-Green.normal'}
					transform="auto"
					_hover={{ bg: 'hu-Green.normalH', scale: 1.05 }}
					_active={{
						bg: 'hu-Green.normalA',
						scale: 1,
					}}
					leftIcon={<AiOutlineCheck />}
					mt={6}
					type="submit"
				>
					Save
				</Button>

				{statusUpEvent === 'running' && <Loading />}
			</Box>
		</>
	)
}
