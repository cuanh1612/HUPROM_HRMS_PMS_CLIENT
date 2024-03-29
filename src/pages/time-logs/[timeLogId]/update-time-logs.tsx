import {
	Avatar,
	Box,
	Button,
	Grid,
	GridItem,
	HStack,
	Input as CInput,
	Text,
	VStack,
} from '@chakra-ui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import { Loading } from 'components/common'
import { Input, Select, SelectCustom, TimePicker } from 'components/form'
import { AuthContext } from 'contexts/AuthContext'
import { updateTimeLogMutation } from 'mutations/timeLog'
import { useRouter } from 'next/router'
import {
	allTasksByProjectQuery,
	detailTaskQuery,
	detailTimeLogQuery,
	timeLogsCalendarQuery,
	timeLogsQuery,
} from 'queries'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { AiOutlineCheck } from 'react-icons/ai'
import { BiMemoryCard } from 'react-icons/bi'
import { BsCalendarDate } from 'react-icons/bs'
import 'react-quill/dist/quill.bubble.css'
import 'react-quill/dist/quill.snow.css'
import { IOption } from 'type/basicTypes'
import { updateProjectTimeLogForm } from 'type/form/basicFormType'
import { compareDateTime } from 'utils/time'
import { CreateProjectTimeLogValidate } from 'utils/validate'

export interface IUpdateTimeLogProps {
	onCloseDrawer?: () => void
	timeLogIdProp?: string | number
}

export default function UpdateTimeLog({ onCloseDrawer, timeLogIdProp }: IUpdateTimeLogProps) {
	const { isAuthenticated, handleLoading, setToast, socket } = useContext(AuthContext)
	const router = useRouter()
	const { timeLogId: timeLogIdRouter } = router.query

	//State -------------------------------------------------------------
	const [optionTasks, setOptionTasks] = useState<IOption[]>([])
	const [optionEmployees, setOptionEmployees] = useState<IOption[]>([])
	const [selectedTaskId, setSelectedTaskId] = useState<number | string>()
	const [selectedEmployeeId, setSelectedEmployeeId] = useState<IOption>()
	const [projectId, setProjectId] = useState<string | number>()

	//Query -------------------------------------------------------------
	const { data: allTasksProject } = allTasksByProjectQuery(isAuthenticated, projectId as string)

	const { data: detailTaskSelected } = detailTaskQuery(isAuthenticated, selectedTaskId)

	const { data: detailTimeLog } = detailTimeLogQuery(
		isAuthenticated,
		timeLogIdProp || (timeLogIdRouter as string)
	)

	// refetch time log
	const { mutate: refetchTimeLogs } = timeLogsQuery(isAuthenticated)

	// refetch time logs in calendar
	const { mutate: refetchTimeLogsCalendar } = timeLogsCalendarQuery({ isAuthenticated })

	//mutation -----------------------------------------------------------
	const [mutateUpdateTimeLog, { status: statusUpdateTimeLog, data: dataUpdateTimeLog }] =
		updateTimeLogMutation(setToast)

	// setForm and submit form update new project timelog -------------------------------
	const formSetting = useForm<updateProjectTimeLogForm>({
		defaultValues: {
			task: undefined,
			employee: undefined,
			starts_on_date: undefined,
			ends_on_date: undefined,
			starts_on_time: '',
			ends_on_time: '',
			memo: '',
		},
		resolver: yupResolver(CreateProjectTimeLogValidate),
	})

	const { handleSubmit } = formSetting

	const onSubmit = async (values: updateProjectTimeLogForm) => {
		if (!projectId) {
			setToast({
				msg: 'Not found project to add new time log',
				type: 'error',
			})
		} else {
			values.project = Number(projectId)
			const invalid = compareDateTime(
				new Date(values.starts_on_date).toLocaleDateString(),
				new Date(values.ends_on_date).toLocaleDateString(),
				values.starts_on_time,
				values.ends_on_time
			)
			if (invalid) {
				setToast({
					msg: 'The end time must be greater than the start time of the time log',
					type: 'error',
				})
			}
			await mutateUpdateTimeLog({
				inputUpdate: values,
				timeLogId: timeLogIdProp || (timeLogIdRouter as string),
			})
		}
	}

	//Function ------------------------------------------------------------------
	//handle when change task
	const onChangeTask = (taskId: string | number) => {
		setSelectedTaskId(taskId)
	}

	//User effect ---------------------------------------------------------------
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
		const subscription = formSetting.watch((value, { name }) => {
			if (name == 'task') {
				onChangeTask(value[name] || '')
			}
		})
		return () => subscription.unsubscribe()
	}, [formSetting.watch])

	//Set project id
	useEffect(() => {
		if (detailTimeLog?.timeLog?.project) {
			setProjectId(detailTimeLog.timeLog.project.id)
		}
	}, [detailTimeLog])

	//Set data option tasks state
	useEffect(() => {
		if (allTasksProject && allTasksProject.tasks) {
			const newOptionTasks: IOption[] = []

			allTasksProject.tasks.map((task) => {
				newOptionTasks.push({
					label: task.name,
					value: task.id,
				})
			})

			setOptionTasks(newOptionTasks)
		}
	}, [allTasksProject])

	//Set data option employees state
	useEffect(() => {
		if (detailTaskSelected && detailTaskSelected.task?.employees) {
			const newOptionEmployees: IOption[] = []

			detailTaskSelected.task.employees.map((employee) => {
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
					value: employee.id,
				})
			})

			//When refetch data tasks, value employee id existing, need to clear option selected employee and employee id form
			setOptionEmployees(newOptionEmployees)
			setSelectedEmployeeId({
				label: <Text color={'gray.400'}>Select...</Text>,
				value: undefined,
			})
			formSetting.setValue('employee', undefined)
		}
	}, [detailTaskSelected])

	//Note when request success
	useEffect(() => {
		if (statusUpdateTimeLog === 'success') {
			//Close drawer when using drawer
			if (onCloseDrawer) {
				onCloseDrawer()
			}

			setToast({
				type: statusUpdateTimeLog,
				msg: dataUpdateTimeLog?.message as string,
			})
			refetchTimeLogs()
			refetchTimeLogsCalendar()

			if (socket) {
				socket.emit('newTimeLog')
			}
		}
	}, [statusUpdateTimeLog])

	//Reset data when have data detail
	useEffect(() => {
		if (detailTimeLog?.timeLog) {
			formSetting.reset({
				task: detailTimeLog.timeLog.task?.id,
				employee: detailTimeLog.timeLog.employee?.id,
				memo: detailTimeLog.timeLog.memo,
				starts_on_date: detailTimeLog.timeLog.starts_on_date,
				starts_on_time: detailTimeLog.timeLog.starts_on_time,
				ends_on_date: detailTimeLog.timeLog.ends_on_date,
				ends_on_time: detailTimeLog.timeLog.ends_on_time,
			})
		}

		if (detailTimeLog?.timeLog?.employee) {
			setSelectedEmployeeId({
				label: (
					<>
						<HStack>
							<Avatar
								size={'xs'}
								name={detailTimeLog.timeLog.employee.name}
								src={detailTimeLog.timeLog.employee.avatar?.url}
							/>
							<Text>{detailTimeLog.timeLog.employee.email}</Text>
						</HStack>
					</>
				),
				value: detailTimeLog.timeLog.employee.id,
			})
		}
	}, [detailTimeLog])

	return (
		<>
			<Box pos="relative" p={6} as={'form'} h="auto" onSubmit={handleSubmit(onSubmit)}>
				<Grid templateColumns="repeat(2, 1fr)" gap={6}>
					<GridItem w="100%" colSpan={[2, 1]}>
						<VStack align={'start'}>
							<Text color={'gray.400'}>Project</Text>
							<CInput
								type={'text'}
								value={detailTimeLog?.timeLog?.project?.name}
								disabled
							/>
						</VStack>
					</GridItem>

					<GridItem w="100%" colSpan={[2, 1]}>
						<Select
							name="task"
							label="task"
							form={formSetting}
							options={optionTasks}
							required={true}
						/>
					</GridItem>

					<GridItem w="100%" colSpan={[2, 1]}>
						<SelectCustom
							placeholder='Select employee'
							name="employee"
							label="employee"
							form={formSetting}
							options={optionEmployees}
							required={true}
							selectedOption={selectedEmployeeId}
						/>
					</GridItem>

					<GridItem w="100%" colSpan={[2, 1]}>
						<Input
							name="memo"
							label="Memo"
							icon={<BiMemoryCard fontSize={'20px'} color="gray" opacity={0.6} />}
							form={formSetting}
							placeholder="Enter Time Log Memo"
							type="text"
							required
						/>
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
				{statusUpdateTimeLog == 'running' && <Loading />}
			</Box>
		</>
	)
}
