import {
	Avatar,
	Box,
	Button,
	Divider,
	Grid,
	GridItem,
	HStack,
	Text,
	useDisclosure,
	VStack,
} from '@chakra-ui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import { Editor, Loading } from 'components/common'
import { Input, Select, SelectMany } from 'components/form'
import Modal from 'components/modal/Modal'
import { AuthContext } from 'contexts/AuthContext'
import { createTaskMutation } from 'mutations'
import { useRouter } from 'next/router'
import {
	allProjectsNormalByEmployeeQuery,
	allProjectsNormalQuery,
	allStatusQuery,
	allStatusTasksQuery,
	allTaskCategoriesQuery,
	allTasksCalendarQuery,
	allTasksQuery,
	detailProjectQuery,
	milestonesByProjectNormalQuery,
} from 'queries'
import { allActivitiesByProjectQuery } from 'queries/ProjectActivity'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { AiFillCaretDown, AiFillCaretUp, AiOutlineCheck } from 'react-icons/ai'
import { BsCalendarDate } from 'react-icons/bs'
import { MdOutlineSubtitles } from 'react-icons/md'
import TaskCategory from 'src/pages/task-categories'
import { IOption } from 'type/basicTypes'
import { createProjectTaskForm } from 'type/form/basicFormType'
import { dataTaskPriority } from 'utils/basicData'
import { CreateProjectTaskValidate } from 'utils/validate'

export interface IAddTaskProps {
	onCloseDrawer?: () => void
}

export default function AddTask({ onCloseDrawer }: IAddTaskProps) {
	const { isAuthenticated, handleLoading, setToast, currentUser, socket } =
		useContext(AuthContext)
	const router = useRouter()

	//state -------------------------------------------------------------
	const [optionTaskCategories, setOptionTaskCategories] = useState<IOption[]>([])
	const [optionProjects, setOptionProjects] = useState<IOption[]>([])
	const [optionEmployees, setOptionEmployees] = useState<IOption[]>([])
	const [description, setDescription] = useState<string>('')
	const [optionStatus, setOptionStatus] = useState<IOption[]>([])
	const [optionMilestones, setOptionMilestones] = useState<IOption[]>([])
	const [selectProjectId, setSelectProjectId] = useState<string | number>()
	const [selectedEmployees, setSelectedEmployees] = useState<IOption[]>()

	//Setup modal -------------------------------------------------------
	const {
		isOpen: isOpenTaskCategory,
		onOpen: onOpenTaskCategory,
		onClose: onCloseTaskCategory,
	} = useDisclosure()

	const {
		isOpen: isOpenOtherDetails,
		onOpen: onOpenOtherDetails,
		onClose: onCloseOtherDetails,
	} = useDisclosure()

	//Query -------------------------------------------------------------
	const { data: dataTaskCategories } = allTaskCategoriesQuery()
	const { data: dataDetailProject } = detailProjectQuery(isAuthenticated, selectProjectId)
	const { data: dataAllStatus } = allStatusQuery(isAuthenticated, selectProjectId)
	const { data: dataAllProjects } =
		currentUser && currentUser.role === 'Admin'
			? allProjectsNormalQuery(isAuthenticated)
			: allProjectsNormalByEmployeeQuery(isAuthenticated, currentUser?.id)

	const { data: dataAllMilestones } = milestonesByProjectNormalQuery(
		isAuthenticated,
		selectProjectId
	)

	// refetch all tasks
	const { mutate: refetchTasks } = allTasksQuery(isAuthenticated)
	// refetch status all status tasks
	const { mutate: refetchStatusTasks } = allStatusTasksQuery(isAuthenticated, selectProjectId)
	// refetch task in calendar
	const { mutate: refetchTasksCalendar } = allTasksCalendarQuery({ isAuthenticated })
	// refetch all activities for project
	const { mutate: refetchActivitiesProject } = allActivitiesByProjectQuery(
		isAuthenticated,
		selectProjectId
	)

	//mutation -----------------------------------------------------------
	const [mutateCreTask, { status: statusCreTask, data: dataCreTask }] =
		createTaskMutation(setToast)

	// setForm and submit form create new task discussion room -----------
	const formSetting = useForm<createProjectTaskForm>({
		defaultValues: {
			project: undefined,
			name: undefined,
			task_category: undefined,
			start_date: undefined,
			deadline: undefined,
			employees: [],
			status: undefined,
			milestone: undefined,
			priority: undefined,
		},
		resolver: yupResolver(CreateProjectTaskValidate),
	})

	const { handleSubmit } = formSetting

	//Function -----------------------------------------------------------
	const onSubmitTask = (value: createProjectTaskForm) => {
		value.description = description
		value.assignBy = currentUser?.id
		mutateCreTask(value)
	}

	const onChangeDescription = (value: string) => {
		setDescription(value)
	}

	//Handle trigger other detail
	const onTriggerOtherDetails = () => {
		if (isOpenOtherDetails) {
			onCloseOtherDetails()
		} else {
			onOpenOtherDetails()
		}
	}

	//Handle change project select
	const onChangeProject = (projectId: string | number) => {
		setSelectProjectId(projectId)

		//Clear select employees
		setSelectedEmployees([])

		//Reset data form
		formSetting.setValue('status', undefined)
		formSetting.setValue('employees', [])
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
		const subscription = formSetting.watch((value: any, { name }) => {
			if (name == 'project') {
				onChangeProject(value[name] || '')
			}
		})
		return () => subscription.unsubscribe()
	}, [formSetting.watch])

	//Set option select status when have data all status
	useEffect(() => {
		if (dataAllStatus?.statuses) {
			//Set data option statuses state
			const newOptionStatus: IOption[] = []

			dataAllStatus.statuses.map((status) => {
				newOptionStatus.push({
					label: status.title,
					value: status.id,
				})
			})

			setOptionStatus(newOptionStatus)
		}
	}, [dataAllStatus])

	//Set option select milestones when have data all milestones
	useEffect(() => {
		if (dataAllMilestones?.milestones) {
			//Set data option milestones state
			const newOptionMilestones: IOption[] = []

			dataAllMilestones.milestones.map((milestone) => {
				newOptionMilestones.push({
					label: milestone.title,
					value: milestone.id,
				})
			})

			setOptionMilestones(newOptionMilestones)
		}
	}, [dataAllMilestones])

	//Note when request success
	useEffect(() => {
		if (statusCreTask === 'success' && dataCreTask) {
			//Close drawer when using drawer
			if (onCloseDrawer) {
				onCloseDrawer()
			}

			setToast({
				type: statusCreTask,
				msg: dataCreTask?.message as string,
			})
			refetchTasks()
			refetchStatusTasks()
			refetchTasksCalendar()
			refetchActivitiesProject()

			if (socket) {
				socket.emit('newTask')
				socket.emit(
					'newTaskNotification',
					dataCreTask.task?.employees.map((employee) => employee.id)
				)
			}
		}
	}, [statusCreTask])

	//Set data option employees state
	useEffect(() => {
		if (dataDetailProject?.project && dataDetailProject.project.employees) {
			const newOptionEmployees: IOption[] = []

			dataDetailProject.project.employees.map((employee) => {
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

			setOptionEmployees(newOptionEmployees)
		}
	}, [dataDetailProject])

	//Set data option task categories when have data from request
	useEffect(() => {
		if (dataTaskCategories?.taskCategories) {
			const newOptionTaskCategories: IOption[] = dataTaskCategories.taskCategories.map(
				(taskCategory) => {
					return {
						value: taskCategory.id.toString(),
						label: taskCategory.name,
					}
				}
			)

			setOptionTaskCategories(newOptionTaskCategories)
		}
	}, [dataTaskCategories])

	//Set data option task categories when have data from request
	useEffect(() => {
		if (dataAllProjects?.projects) {
			const newOptionProject: IOption[] = dataAllProjects.projects.map((project) => {
				return {
					value: project.id,
					label: project.name,
				}
			})

			setOptionProjects(newOptionProject)
		}
	}, [dataAllProjects])

	return (
		<Box pos="relative" p={6} as={'form'} h="auto" onSubmit={handleSubmit(onSubmitTask)}>
			<Grid templateColumns="repeat(2, 1fr)" gap={6}>
				<GridItem w="100%" colSpan={[2, 1]}>
					<Input
						name="name"
						label="Task Name"
						icon={<MdOutlineSubtitles fontSize={'20px'} color="gray" opacity={0.6} />}
						form={formSetting}
						placeholder="Enter Note Title"
						type="text"
						required
					/>
				</GridItem>

				<GridItem w="100%" colSpan={[2, 1]}>
					<Select
						name="task_category"
						label="Task Category"
						required={false}
						form={formSetting}
						placeholder={'Select Task Category'}
						options={optionTaskCategories}
						isModal={true}
						onOpenModal={onOpenTaskCategory}
					/>
				</GridItem>

				<GridItem w="100%" colSpan={[2, 1]}>
					<Select
						name="project"
						label="Project"
						required={true}
						form={formSetting}
						placeholder={'Select Project'}
						options={optionProjects}
					/>
				</GridItem>

				<GridItem w="100%" colSpan={[2, 1]}>
					<Input
						name="start_date"
						label="Start Date"
						icon={<BsCalendarDate fontSize={'20px'} color="gray" opacity={0.6} />}
						form={formSetting}
						type="date"
						required
					/>
				</GridItem>

				<GridItem w="100%" colSpan={[2, 1]}>
					<Input
						name="deadline"
						label="Due Date"
						icon={<BsCalendarDate fontSize={'20px'} color="gray" opacity={0.6} />}
						form={formSetting}
						type="date"
						required
					/>
				</GridItem>

				<GridItem w="100%" colSpan={[2, 1]}>
					<Select
						placeholder="Select status"
						name="status"
						label="Status"
						form={formSetting}
						options={optionStatus}
						required={true}
					/>
				</GridItem>

				<GridItem w="100%" colSpan={[2]}>
					<SelectMany
						placeholder='Select employees'
						form={formSetting}
						label={'Employees'}
						name={'employees'}
						required={true}
						options={optionEmployees}
						selectedOptions={selectedEmployees}
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
			</Grid>

			<Divider marginY={6} />
			<HStack onClick={onTriggerOtherDetails} cursor={'pointer'}>
				{isOpenOtherDetails ? <AiFillCaretUp /> : <AiFillCaretDown />}
				<Text fontSize={20} fontWeight={'semibold'}>
					Other Details
				</Text>
			</HStack>

			{isOpenOtherDetails && (
				<Grid templateColumns="repeat(2, 1fr)" gap={6} mt={6}>
					<GridItem w="100%" colSpan={[2, 1]}>
						<Select
							name="milestone"
							label="Milestone"
							required={false}
							form={formSetting}
							placeholder={'Select Milestone'}
							options={optionMilestones}
						/>
					</GridItem>

					<GridItem w="100%" colSpan={[2, 1]}>
						<Select
							name="priority"
							label="Priority"
							form={formSetting}
							options={dataTaskPriority}
							required={false}
						/>
					</GridItem>
				</Grid>
			)}

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
			{statusCreTask == 'running' && <Loading />}

			{/* Modal department and designation */}
			<Modal
				size="3xl"
				isOpen={isOpenTaskCategory}
				onOpen={onOpenTaskCategory}
				onClose={onCloseTaskCategory}
				title="Task Category"
			>
				<TaskCategory />
			</Modal>
		</Box>
	)
}
