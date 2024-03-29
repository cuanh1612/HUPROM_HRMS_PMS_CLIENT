import { Box, Button, useDisclosure, VStack } from '@chakra-ui/react'
import { AlertDialog, Func, FuncCollapse, Head, Table } from 'components/common'
import { DateRange, Input, Select as SelectF } from 'components/filter'
import { ProjectLayout } from 'components/layouts'
import { AuthContext } from 'contexts/AuthContext'
import { deleteTaskMutation, deleteTasksMutation } from 'mutations'
import { useRouter } from 'next/router'
import {
	allStatusQuery,
	allTasksByEmployeeAndProjectQuery,
	allTasksByProjectQuery,
	detailProjectQuery,
	milestonesByProjectNormalQuery,
} from 'queries'
import { useContext, useEffect, useState } from 'react'
import { AiOutlineDelete, AiOutlineSearch } from 'react-icons/ai'
import { IoAdd } from 'react-icons/io5'
import { NextLayout } from 'type/element/layout'
import { IFilter, TColumn } from 'type/tableTypes'
import AddTask from './add-tasks'
import DetailTask from './[taskId]'
import UpdateTask from './[taskId]/update-task'
import { CSVLink } from 'react-csv'
import { BiExport } from 'react-icons/bi'
import { VscFilter } from 'react-icons/vsc'
import { Drawer } from 'components/Drawer'
import { projectTasksColumn } from 'utils/columns'

const tasks: NextLayout = () => {
	const { isAuthenticated, handleLoading, currentUser, setToast, socket } =
		useContext(AuthContext)
	const router = useRouter()
	const { projectId } = router.query

	const [taskId, setTaskId] = useState<number>()
	const [statusIdShow] = useState<number>(1)

	// is reset table
	const [isResetFilter, setIsReset] = useState(false)

	//state csv
	const [dataCSV, setDataCSV] = useState<any[]>([])

	// data select to delete all
	const [dataSl, setDataSl] = useState<Array<number> | null>()

	// set loading table
	const [isLoading, setIsLoading] = useState(true)

	// set filter
	const [filter, setFilter] = useState<IFilter>({
		columnId: '',
		filterValue: '',
	})

	//Modal -------------------------------------------------------------
	// set open add task
	const {
		isOpen: isOpenAddTask,
		onOpen: onOpenAddTask,
		onClose: onCloseAddTask,
	} = useDisclosure()

	// set open update task
	const {
		isOpen: isOpenUpdateTask,
		onOpen: onOpenUpdateTask,
		onClose: onCloseUpdateTask,
	} = useDisclosure()

	// set open detail task
	const {
		isOpen: isOpenDetailTask,
		onOpen: onOpenDetailTask,
		onClose: onCloseDetailTask,
	} = useDisclosure()

	// set isOpen of dialog to delete one
	const { isOpen: isOpenDialogDl, onOpen: onOpenDl, onClose: onCloseDl } = useDisclosure()

	// set isOpen of dialog to delete many
	const {
		isOpen: isOpenDialogDlMany,
		onOpen: onOpenDlMany,
		onClose: onCloseDlMany,
	} = useDisclosure()

	// set isOpen of drawer to filters
	const { isOpen: isOpenFilter, onOpen: onOpenFilter, onClose: onCloseFilter } = useDisclosure()

	// query
	const { data: dataDetailProject } = detailProjectQuery(isAuthenticated, projectId)

	// get all task by project
	const { data: allTasks, mutate: refetchTasks } =
		currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Client')
			? allTasksByProjectQuery(isAuthenticated, projectId)
			: allTasksByEmployeeAndProjectQuery(
					isAuthenticated,
					currentUser?.id,
					projectId as string
			  )

	// get all status to filter
	const { data: allStatuses } = allStatusQuery(isAuthenticated, projectId)

	// get all milestones to filter
	const { data: allMilestones } = milestonesByProjectNormalQuery(isAuthenticated, projectId)

	// mutation

	// delete one
	const [deleteOne, { data: dataDlOne, status: statusDlOne }] = deleteTaskMutation(setToast)
	const [deleteMany, { data: dataDlMany, status: statusDlMany }] = deleteTasksMutation(setToast)

	//Setup download csv --------------------------------------------------------
	const headersCSV = [
		{ label: 'id', key: 'id' },
		{ label: 'name', key: 'name' },
		{ label: 'assignBy', key: 'assignBy' },
		{ label: 'start_date', key: 'start_date' },
		{ label: 'deadline', key: 'deadline' },
		{ label: 'description', key: 'description' },
		{ label: 'milestone', key: 'milestone' },
		{ label: 'priority', key: 'priority' },
		{ label: 'project', key: 'project' },
		{ label: 'status', key: 'status' },
		{ label: 'task_category', key: 'task_category' },
		{ label: 'createdAt', key: 'createdAt' },
		{ label: 'updatedAt', key: 'updatedAt' },
	]

	//UseEffect ---------------------------------------------------------
	//Handle check login successfully
	useEffect(() => {
		if (isAuthenticated) {
			handleLoading(false)
		} else {
			if (isAuthenticated === false) {
				router.push('/login')
			}
		}
	}, [isAuthenticated])

	// when get all tasks success
	useEffect(() => {
		if (allTasks) {
			setIsLoading(false)

			if (allTasks.tasks) {
				//Set data csv
				const dataCSV: any[] = allTasks.tasks.map((task) => ({
					id: task.id,
					name: task.name,
					assignBy: task.assignBy?.id,
					start_date: task.start_date,
					deadline: task.deadline,
					description: task.description,
					milestone: task.milestone?.id,
					priority: task.priority,
					project: task.project.id,
					status: task.status.id,
					task_category: task.task_category?.id,
					createdAt: task.createdAt,
					updatedAt: task.updatedAt,
				}))

				setDataCSV(dataCSV)
			}
		}
	}, [allTasks])

	useEffect(() => {
		if (statusDlOne == 'success' && dataDlOne) {
			setToast({
				type: statusDlOne,
				msg: dataDlOne.message,
			})
			refetchTasks()
			setIsLoading(false)
			if (socket && projectId) {
				socket.emit('newProjectTask', projectId)
			}
		}
	}, [statusDlOne])

	useEffect(() => {
		if (statusDlMany == 'success' && dataDlMany) {
			setToast({
				type: statusDlMany,
				msg: dataDlMany.message,
			})
			refetchTasks()
			setDataSl([])
			setIsLoading(false)
			if (socket && projectId) {
				socket.emit('newProjectTask', projectId)
			}
		}
	}, [statusDlMany])

	//Join room socket
	useEffect(() => {
		//Join room
		if (socket && projectId) {
			socket.emit('joinRoomProjectTask', projectId)

			socket.on('getNewProjectTask', () => {
				refetchTasks()
			})
		}

		//Leave room
		function leaveRoom() {
			if (socket && projectId) {
				socket.emit('leaveRoomProjectTask', projectId)
			}
		}

		return leaveRoom
	}, [socket, projectId])

	// header ----------------------------------------
	const columns: TColumn[] = projectTasksColumn({
		currentUser,
		onDelete: (id: number) => {
			setTaskId(Number(id))
			onOpenDl()
		},
		onDetail: (id: number) => {
			setTaskId(Number(id))
			onOpenDetailTask()
		},
		onUpdate: (id: number) => {
			setTaskId(id)
			onOpenUpdateTask()
		},
	})

	return (
		<Box pb={8}>
			<Head title={dataDetailProject?.project?.name} />

			<FuncCollapse>
				{((currentUser && currentUser.role === 'Admin') ||
					(currentUser &&
						dataDetailProject?.project?.project_Admin &&
						currentUser.email === dataDetailProject.project.project_Admin.email)) && (
					<>
						<Func
							icon={<IoAdd />}
							description={'Add new task by form'}
							title={'Add new'}
							action={onOpenAddTask}
						/>

						<CSVLink filename={'tasks.csv'} headers={headersCSV} data={dataCSV}>
							<Func
								icon={<BiExport />}
								description={'export to csv'}
								title={'export'}
								action={() => {}}
							/>
						</CSVLink>
						<Func
							icon={<AiOutlineDelete />}
							title={'Delete all'}
							description={'Delete all tasks you selected'}
							action={onOpenDlMany}
							disabled={!dataSl || dataSl.length == 0 ? true : false}
						/>
					</>
				)}
				<Func
					icon={<VscFilter />}
					description={'Open draw to filter'}
					title={'filter'}
					action={onOpenFilter}
				/>
			</FuncCollapse>

			<Table
				data={allTasks?.tasks || []}
				columns={columns}
				isLoading={isLoading}
				isSelect={currentUser?.role == 'Admin'}
				selectByColumn="id"
				setSelect={(data: Array<number>) => setDataSl(data)}
				filter={filter}
				disableColumns={['milestone']}
				isResetFilter={isResetFilter}
			/>

			<Drawer size="xl" title="Add New Task" onClose={onCloseAddTask} isOpen={isOpenAddTask}>
				<AddTask statusId={statusIdShow} onCloseDrawer={onCloseAddTask} />
			</Drawer>

			<Drawer
				size="xl"
				title="Update Task"
				onClose={onCloseUpdateTask}
				isOpen={isOpenUpdateTask}
			>
				<UpdateTask taskIdProp={taskId} onCloseDrawer={onCloseUpdateTask} />
			</Drawer>

			<Drawer
				size="xl"
				title={`Task #${taskId}`}
				onClose={onCloseDetailTask}
				isOpen={isOpenDetailTask}
			>
				<DetailTask taskIdProp={taskId} onCloseDrawer={onCloseDetailTask} />
			</Drawer>

			{/* alert dialog when delete one */}
			<AlertDialog
				handleDelete={() => {
					setIsLoading(true)
					deleteOne(String(taskId))
				}}
				title="Are you sure?"
				content="You will not be able to recover the deleted record!"
				isOpen={isOpenDialogDl}
				onClose={onCloseDl}
			/>

			{/* alert dialog when delete many */}
			<AlertDialog
				handleDelete={() => {
					if (dataSl) {
						setIsLoading(true)
						deleteMany(dataSl)
					}
				}}
				title="Are you sure to delete all?"
				content="You will not be able to recover the deleted record!"
				isOpen={isOpenDialogDlMany}
				onClose={onCloseDlMany}
			/>

			<Drawer
				size="xs"
				isOpen={isOpenFilter}
				onClose={onCloseFilter}
				title={'Filter'}
				footer={
					<Button
						onClick={() => {
							setIsReset(true)
							setTimeout(() => {
								setIsReset(false)
							}, 1000)
						}}
					>
						reset
					</Button>
				}
			>
				<VStack spacing={5} p={6}>
					<Input
						handleSearch={(data: IFilter) => {
							setFilter(data)
						}}
						columnId={'name'}
						label="Task"
						placeholder="Enter task title"
						icon={<AiOutlineSearch fontSize={'20px'} color="gray" opacity={0.6} />}
						type={'text'}
					/>
					<DateRange
						handleSelect={(date: { from: Date; to: Date }) => {
							setFilter({
								columnId: 'deadline',
								filterValue: date,
							})
						}}
						label="Select date"
					/>
					<SelectF
						options={allStatuses?.statuses?.map((item) => ({
							label: item.title,
							value: item.id,
						}))}
						handleSearch={(data: IFilter) => {
							setFilter(data)
						}}
						columnId={'status'}
						label="Status"
						placeholder="Select status"
					/>
					<SelectF
						options={allMilestones?.milestones?.map((item) => ({
							label: item.title,
							value: item.id,
						}))}
						handleSearch={(data: IFilter) => {
							setFilter(data)
						}}
						columnId={'milestone'}
						label="Milestone"
						placeholder="Select milestone"
					/>
				</VStack>
			</Drawer>
		</Box>
	)
}

tasks.getLayout = ProjectLayout

export default tasks
