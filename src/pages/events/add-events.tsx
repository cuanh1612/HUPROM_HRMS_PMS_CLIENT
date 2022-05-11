import {
	Avatar,
	Box,
	Button,
	Checkbox,
	Grid,
	GridItem,
	HStack,
	Text,
	VStack
} from '@chakra-ui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import { Input } from 'components/form/Input'
import { InputNumber } from 'components/form/InputNumber'
import { Select } from 'components/form/Select'
import SelectMany from 'components/form/SelectMany'
import Loading from 'components/Loading'
import { AuthContext } from 'contexts/AuthContext'
import { createEventMutation } from 'mutations/event'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { allClientsQuery } from 'queries/client'
import { allEmployeesQuery } from 'queries/employee'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { AiOutlineBgColors, AiOutlineCheck } from 'react-icons/ai'
import { BsCalendarDate } from 'react-icons/bs'
import { MdOutlineDriveFileRenameOutline, MdPlace } from 'react-icons/md'
import 'react-quill/dist/quill.bubble.css'
import 'react-quill/dist/quill.snow.css'
import { IOption } from 'type/basicTypes'
import { createEventForm } from 'type/form/basicFormType'
import { dataTypeRepeat } from 'utils/basicData'
import { createEventValidate } from 'utils/validate'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export interface IAddEventProps {
	onCloseDrawer: () => void
}

export default function AddEvent({ onCloseDrawer }: IAddEventProps) {
	const { isAuthenticated, handleLoading, setToast } = useContext(AuthContext)
	const router = useRouter()

	//State ----------------------------------------------------------------------
	const [description, setDescription] = useState<string>('')
	const [optionEmployees, setOptionEmployees] = useState<IOption[]>([])
	const [optionClients, setOptionClients] = useState<IOption[]>([])
	const [isRepeatEvent, setIsRepeatEvent] = useState<boolean>(false)

	//query ----------------------------------------------------------------------
	// get all employees
	const { data: allEmployees } = allEmployeesQuery(isAuthenticated)

	// get all clients
	const { data: allClients } = allClientsQuery(isAuthenticated)

	//mutation -------------------------------------------------------------------
	const [mutateCreEvent, { status: statusCreEvent, data: dataCreEvent }] =
		createEventMutation(setToast)

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

	//Set data option employees state
	useEffect(() => {
		if (allEmployees && allEmployees.employees) {
			let newOptionEmployees: IOption[] = []

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
			let newOptionClients: IOption[] = []

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
		if (statusCreEvent === 'success') {
			//Close drawer when using drawer
			if (onCloseDrawer) {
				onCloseDrawer()
			}

			setToast({
				type: 'success',
				msg: dataCreEvent?.message as string,
			})
		}
	}, [statusCreEvent])

	// setForm and submit form create new contract -------------------------------
	const formSetting = useForm<createEventForm>({
		defaultValues: {
			name: '',
			color: '#FF0000',
			where: '',
			starts_on_date: undefined,
			ends_on_date: undefined,
			employeeEmails: [],
			clientEmails: [],
			repeatEvery: 1,
			cycles: 1,
			typeRepeat: undefined,
		},
		resolver: yupResolver(createEventValidate),
	})

	const { handleSubmit } = formSetting

	const onSubmit = async (values: createEventForm) => {
		if (!description) {
			setToast({
				msg: 'Please enter field description',
				type: 'warning',
			})
		} else {
			values.description = description
			values.isRepeat = isRepeatEvent
			if (!isRepeatEvent) {
				values.repeatEvery = undefined
				values.cycles = undefined
			} else if (values.repeatEvery && values.cycles) {
				values.repeatEvery = Number(values.repeatEvery)
				values.cycles = Number(values.cycles)
			}

			mutateCreEvent(values)
		}
	}

	//Funtion -------------------------------------------------------------------
	const onChangeDescription = (value: string) => {
		setDescription(value)
	}

	//Handle change is repeat
	const onChangeIsRepeat = () => {
		setIsRepeatEvent(!isRepeatEvent)
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
							<ReactQuill
								placeholder="Enter you text"
								modules={{
									toolbar: [
										['bold', 'italic', 'underline', 'strike'], // toggled buttons
										['blockquote', 'code-block'],

										[{ header: 1 }, { header: 2 }], // custom button values
										[{ list: 'ordered' }, { list: 'bullet' }],
										[{ script: 'sub' }, { script: 'super' }], // superscript/subscript
										[{ indent: '-1' }, { indent: '+1' }], // outdent/indent
										[{ direction: 'rtl' }], // text direction

										[{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
										[{ header: [1, 2, 3, 4, 5, 6, false] }],

										[{ color: [] }, { background: [] }], // dropdown with defaults from theme
										[{ font: [] }],
										[{ align: [] }],

										['clean'], // remove formatting button
									],
								}}
								value={description}
								onChange={onChangeDescription}
							/>
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

					<GridItem w="100%" colSpan={[2]}>
						<SelectMany
							form={formSetting}
							label={'Select Employee'}
							name={'employeeEmails'}
							required={true}
							options={optionEmployees}
						/>
					</GridItem>

					<GridItem w="100%" colSpan={[2]}>
						<SelectMany
							form={formSetting}
							label={'Select Client'}
							name={'clientEmails'}
							required={true}
							options={optionClients}
						/>
					</GridItem>

					<GridItem w="100%" colSpan={[2]}>
						<HStack>
							<Checkbox isChecked={isRepeatEvent} onChange={onChangeIsRepeat} />
							<Text>Repeat</Text>
						</HStack>
					</GridItem>

					{isRepeatEvent && (
						<>
							<GridItem w="100%" colSpan={[2, 1]}>
								<InputNumber
									name="repeatEvery"
									label="Repeat every"
									form={formSetting}
									required
									min={1}
								/>
							</GridItem>

							<GridItem w="100%" colSpan={[2, 1]}>
								<Select
									form={formSetting}
									label={'Repeat Type'}
									required={true}
									name={'typeRepeat'}
									placeholder={'Select type repeat'}
									options={dataTypeRepeat}
								/>
							</GridItem>

							<GridItem w="100%" colSpan={[2, 1]}>
								<InputNumber
									name="cycles"
									label="Cycles"
									form={formSetting}
									required
									min={1}
								/>
							</GridItem>
						</>
					)}
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

				{statusCreEvent === 'running' && <Loading />}
			</Box>
		</>
	)
}
