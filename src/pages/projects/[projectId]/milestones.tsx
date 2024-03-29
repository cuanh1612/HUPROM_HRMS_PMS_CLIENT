import {
	Box,
	Divider,
	HStack,
	TableContainer,
	Text,
	useDisclosure,
	VStack,
	Table as CTable,
	Thead,
	Tr,
	Th,
	Tbody,
	Td,
	Avatar,
	AvatarGroup,
	useColorMode,
} from '@chakra-ui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import { AlertDialog, Table, Loading, Func, FuncCollapse, Head } from 'components/common'
import { Input, InputNumber, Select, Textarea } from 'components/form'
import { ProjectLayout } from 'components/layouts'
import Modal from 'components/modal/Modal'
import { AuthContext } from 'contexts/AuthContext'
import {
	createMilestoneTypeMutation,
	deleteMilestoneMutation,
	updateMilestoneMutation,
} from 'mutations'
import { useRouter } from 'next/router'
import { detailMilestoneQuery, detailProjectQuery, milestonesByProjectNormalQuery } from 'queries'
import React, { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { MdDriveFileRenameOutline } from 'react-icons/md'
import { NextLayout } from 'type/element/layout'
import { milestoneForm } from 'type/form/basicFormType'
import { TColumn } from 'type/tableTypes'
import { milestoneValidate } from 'utils/validate'
import { milestoneType } from 'type/basicTypes'
import { IoAdd } from 'react-icons/io5'
import { projectMilestonesColumn } from 'utils/columns'

import { allActivitiesByProjectQuery } from 'queries/ProjectActivity'

const milestones: NextLayout = () => {
	const { isAuthenticated, handleLoading, setToast, currentUser } = useContext(AuthContext)
	const router = useRouter()
	const { projectId } = router.query
	const {colorMode} = useColorMode()

	// set loading table
	const [isLoading, setIsLoading] = useState(true)
	const [idMilestone, setIdMilestone] = useState<string | number>()
	const [isUpdate, setIsUpdate] = useState(false)

	// set data to show detail modal
	const [idDetail, setIdDetail] = useState<number>()
	const [dataDetail, setDataDetail] = useState<milestoneType>()

	// open modal to update, create milestone
	const { isOpen: isOpenModal, onClose: onCloseModal, onOpen: onOpenModal } = useDisclosure()

	// open modal to show detail milestone
	const { isOpen: isOpenDetail, onClose: onCloseDetail, onOpen: onOpenDetail } = useDisclosure()

	// set isOpen of dialog to delete one
	const { isOpen: isOpenDialogDl, onOpen: onOpenDl, onClose: onCloseDl } = useDisclosure()

	// get all milestone by project
	const { data: allMilestone, mutate: refetchAllMilestones } = milestonesByProjectNormalQuery(
		isAuthenticated,
		projectId
	)

	// refetch all activities for project
	const { mutate: refetchActivitiesProject } = allActivitiesByProjectQuery(
		isAuthenticated,
		projectId
	)

	const { data: dataDetailProject } = detailProjectQuery(isAuthenticated, projectId)

	// get detail milestone
	const { data: detailMilestone } = detailMilestoneQuery(isAuthenticated, idDetail)

	const [createMilestone, { status: statusCreate, data: dataCreate }] =
		createMilestoneTypeMutation(setToast)

	const [updateMilestone, { status: statusUpdate, data: dataUpdate }] =
		updateMilestoneMutation(setToast)

	// delete milestone
	const [deleteMilestone, { status: statusDelete, data: dataDelete }] =
		deleteMilestoneMutation(setToast)

	useEffect(() => {
		if (isAuthenticated) {
			handleLoading(false)
		} else {
			if (isAuthenticated === false) {
				router.push('/login')
			}
		}
	}, [isAuthenticated])

	// when get detail milestone success
	useEffect(() => {
		if (detailMilestone) {
			setDataDetail(detailMilestone.milestone)
		}
	}, [detailMilestone])

	// when close detail modal
	useEffect(() => {
		if (!isOpenDetail) {
			setDataDetail(undefined)
			setIdDetail(undefined)
		}
	}, [isOpenDetail])

	// setForm and submit form create and update milestone ----------------------------------------------------------
	const formSetting = useForm<milestoneForm>({
		defaultValues: {
			addtobudget: 1,
			cost: 1,
			status: 1,
			title: '',
			summary: '',
		},
		resolver: yupResolver(milestoneValidate),
	})

	const { handleSubmit } = formSetting

	//Handle crete user
	const onSubmit = async (values: milestoneForm) => {
		values = {
			...values,
			status: values.status == 1 ? false : true,
			addtobudget: values.addtobudget == 1 ? false : true,
		}

		const data = {
			...values,
			project: projectId,
		}

		if (isUpdate) {
			await updateMilestone({
				inputUpdate: data,
				milestoneId: idMilestone,
			})
		} else {
			await createMilestone(data)
		}
	}

	// header ----------------------------------------
	const columns: TColumn[] = projectMilestonesColumn({
		onDelete: (id: number) => {
			setIdMilestone(id)
			onOpenDl()
		},
		onUpdate: (id: number, row: any) => {
			setIdMilestone(id)
			formSetting.reset({
				...row.values,
				status: row.values['status'] == true ? 2 : 1,
				addtobudget: row.original['addtobudget'] == true ? 2 : 1,
				summary: row.original['summary'],
			})
			setIsUpdate(true)
			onOpenModal()
		},
		onDetail: (id: number) => {
			onOpenDetail()
			setIdDetail(Number(id))
		},
		currentUser,
		colorMode
	})

	useEffect(() => {
		if (statusCreate == 'success' && dataCreate) {
			setToast({
				type: statusCreate,
				msg: dataCreate.message,
			})
			onCloseModal()
			refetchAllMilestones()
			refetchActivitiesProject()
		}
	}, [statusCreate])

	useEffect(() => {
		if (statusUpdate == 'success' && dataUpdate) {
			setToast({
				type: statusUpdate,
				msg: dataUpdate.message,
			})
			onCloseModal()
			refetchAllMilestones()
		}
	}, [statusUpdate])

	useEffect(() => {
		if (statusDelete == 'success' && dataDelete) {
			setToast({
				type: statusDelete,
				msg: dataDelete.message,
			})
			refetchAllMilestones()
		}
	}, [statusDelete])

	useEffect(() => {
		if (allMilestone) {
			setIsLoading(false)
		}
	}, [allMilestone])

	return (
		<Box pb={8}>
			<Head title={dataDetailProject?.project?.name} />
			{currentUser &&
				(currentUser.role === 'Admin' ||
					currentUser.email === dataDetailProject?.project?.project_Admin?.email) && (
					<FuncCollapse>
						<Func
							icon={<IoAdd />}
							description={'Add new milestone by form'}
							title={'Add new'}
							action={() => {
								formSetting.reset({
									addtobudget: 1,
									cost: 1,
									status: 1,
									title: '',
									summary: '',
								})
								setIsUpdate(false)
								onOpenModal()
							}}
						/>
					</FuncCollapse>
				)}
			<Table
				data={allMilestone?.milestones || []}
				columns={columns}
				isLoading={isLoading}
				isSelect={false}
			/>
			<Modal
				onOk={() => {}}
				size={'xl'}
				onClose={onCloseModal}
				onOpen={onOpenModal}
				title={isUpdate ? 'Update milestone' : 'Add milestone'}
				isOpen={isOpenModal}
				form={'milestone'}
			>
				<VStack
					as={'form'}
					onSubmit={handleSubmit(onSubmit)}
					id={'milestone'}
					spacing={5}
					paddingInline={6}
				>
					<HStack alignItems="start" w={'full'} spacing={5}>
						<Input
							name="title"
							label="Title"
							icon={
								<MdDriveFileRenameOutline
									fontSize={'20px'}
									color="gray"
									opacity={0.6}
								/>
							}
							form={formSetting}
							placeholder="Enter title"
							type="text"
							required
						/>
						<InputNumber
							min={1}
							form={formSetting}
							label={'Cost'}
							name={'cost'}
							required={true}
						/>
					</HStack>
					<HStack alignItems="start" w={'full'} spacing={5}>
						<Select
							options={[
								{
									label: 'Incomplete',
									value: 1,
								},
								{
									label: 'Complete',
									value: 2,
								},
							]}
							name={'status'}
							form={formSetting}
							label={'Status'}
							required={false}
						/>
						<Select
							options={[
								{
									label: 'Incomplete',
									value: 1,
								},
								{
									label: 'Complete',
									value: 2,
								},
							]}
							name={'addtobudget'}
							form={formSetting}
							label={'Add cost to project budget'}
							required={false}
						/>
					</HStack>
					<Textarea
						form={formSetting}
						label={'Summary'}
						required={true}
						name={'summary'}
						placeholder={'Enter summary'}
					/>
				</VStack>
			</Modal>

			{/* alert dialog when delete one */}
			<AlertDialog
				handleDelete={() => {
					setIsLoading(true)
					deleteMilestone(String(idMilestone))
				}}
				title="Are you sure?"
				content="You will not be able to recover the deleted record!"
				isOpen={isOpenDialogDl}
				onClose={onCloseDl}
			/>

			{/* view detail milestone */}
			<Modal
				size={'6xl'}
				onClose={onCloseDetail}
				onOpen={onOpenDetail}
				title={'Detail mile stone'}
				isOpen={isOpenDetail}
			>
				{!dataDetail ? (
					<Box minH={'100px'}>
						<Loading />
					</Box>
				) : (
					<VStack paddingInline={6} spacing={5}>
						<VStack w={'full'} spacing={5}>
							<HStack w={'full'}>
								<Text w={'150px'} color={'gray'}>
									Milestone Title
								</Text>
								<Text>{dataDetail.title}</Text>
							</HStack>
							<HStack w={'full'}>
								<Text minW={'150px'} color={'gray'}>
									Milestone Cost
								</Text>
								<Text>${dataDetail.cost}</Text>
							</HStack>
							<HStack w={'full'}>
								<Text minW={'150px'} color={'gray'}>
									Status
								</Text>
								<Text>${dataDetail.status ? 'Complete' : 'Incomplete'}</Text>
							</HStack>
							<HStack w={'full'}>
								<Text minW={'150px'} color={'gray'}>
									Milestone Summary
								</Text>
								<Text>{dataDetail.summary}</Text>
							</HStack>
							<HStack w={'full'}>
								<Text minW={'150px'} color={'gray'}>
									Total Hours
								</Text>
								<Text>0</Text>
							</HStack>
						</VStack>
						<Divider />
						<VStack w={'full'}>
							<Text w={'full'} fontWeight={'semibold'} fontSize={'xl'}>
								Tasks
							</Text>
							<TableContainer w={'full'}>
								<CTable variant="simple">
									<Thead>
										<Tr>
											<Th>Id</Th>
											<Th>Task</Th>
											<Th>Assign To</Th>
											<Th>Assign By</Th>
											<Th>Due Date</Th>
											<Th>Total hours</Th>
											<Th>Status</Th>
										</Tr>
									</Thead>
									<Tbody>
										{dataDetail.tasks &&
											dataDetail.tasks.map((task, key) => (
												<Tr key={key}>
													<Td>{task.id}</Td>
													<Td>{task.name}</Td>
													<Td>
														<AvatarGroup size="sm" max={2}>
															{task.employees.map((employee) => (
																<Avatar
																	key={employee.id}
																	name={employee.name}
																	src={employee.avatar?.url}
																/>
															))}
														</AvatarGroup>
													</Td>
													<Td>{task?.assignBy?.name}</Td>
													<Td>{`${new Date(task.deadline).getDate()}-${
														new Date(task.deadline).getMonth() + 1
													}-${new Date(
														task.deadline
													).getFullYear()}`}</Td>
													<Td>0</Td>
													<Td>
														<HStack alignItems={'center'} spacing={4}>
															<Box
																background={task.status.color}
																w={'2'}
																borderRadius={'full'}
																h={'2'}
															/>
															<Text>{task.status.title}</Text>
														</HStack>
													</Td>
												</Tr>
											))}
									</Tbody>
								</CTable>
							</TableContainer>
						</VStack>
					</VStack>
				)}
			</Modal>
		</Box>
	)
}

milestones.getLayout = ProjectLayout

export default milestones
