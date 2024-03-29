import { Box, Button, useColorMode, useDisclosure, VStack } from '@chakra-ui/react'
import { AlertDialog, Func, FuncCollapse, Head, Table } from 'components/common'
import { Drawer } from 'components/Drawer'
import { DateRange, Input, Select as FSelect } from 'components/filter'
import { ClientLayout } from 'components/layouts'
import { AuthContext } from 'contexts/AuthContext'
import {
	deleteJobApplicationMutation,
	deleteJobApplicationsMutation,
	updateJobApplicationStatusMutation,
} from 'mutations/jobApplication'

import { useRouter } from 'next/router'
import { allJobsQuery } from 'queries/job'
import { allJobApplicationsQuery } from 'queries/jobApplication'
import { allLocationsQuery } from 'queries/location'
import { useContext, useEffect, useState } from 'react'
import { CSVLink } from 'react-csv'
import { AiOutlineDelete, AiOutlineSearch } from 'react-icons/ai'
import { BiExport } from 'react-icons/bi'
import { IoAdd } from 'react-icons/io5'
import { VscFilter } from 'react-icons/vsc'
import { NextLayout } from 'type/element/layout'
import { IFilter, TColumn } from 'type/tableTypes'
import { dataJobApplicationStatus } from 'utils/basicData'
import { jobApplicationColumn } from 'utils/columns'
import AddJobApplications from './add-job-applications'
import DetailJobApplication from './[jobApplicationId]'
import UpdateJobApplication from './[jobApplicationId]/update'
// import UpdateJob from './[jobId]/update'

const jobApplications: NextLayout = () => {
	const { isAuthenticated, handleLoading, currentUser, setToast } = useContext(AuthContext)
	const router = useRouter()
	const {colorMode} = useColorMode()

	// state
	const [idJobApplication, setIdJobApplication] = useState<number | null>(null)
	// set loading table
	const [isLoading, setIsLoading] = useState(true)

	// data select to delete all
	const [dataSl, setDataSl] = useState<Array<number> | null>()

	// is reset table
	const [isResetFilter, setIsReset] = useState(false)
	// set filter
	const [filter, setFilter] = useState<IFilter>({
		columnId: '',
		filterValue: '',
	})
	//State download csv
	const [dataCSV, setDataCSV] = useState<any[]>([])

	//Setup drawer --------------------------------------------------------------
	const { isOpen: isOpenAdd, onOpen: onOpenAdd, onClose: onCloseAdd } = useDisclosure()
	const { isOpen: isOpenUpdate, onOpen: onOpenUpdate, onClose: onCloseUpdate } = useDisclosure()
	// set isOpen of dialog to filters
	const { isOpen: isOpenFilter, onOpen: onOpenFilter, onClose: onCloseFilter } = useDisclosure()
	// set isOpen of dialog to delete one
	const { isOpen: isOpenDialogDl, onOpen: onOpenDl, onClose: onCloseDl } = useDisclosure()

	// set isOpen of dialog to delete one
	const {
		isOpen: isOpenDialogDlMany,
		onOpen: onOpenDlMany,
		onClose: onCloseDlMany,
	} = useDisclosure()
	const { isOpen: isOpenDetail, onOpen: onOpenDetail, onClose: onCloseDetail } = useDisclosure()

	//Query ---------------------------------------------------------------------
	const { data: dataAllJobApplications, mutate: refetchAllData } =
		allJobApplicationsQuery(isAuthenticated)

	const { data: dataAllLocations } = allLocationsQuery()
	const { data: dataAllJobs } = allJobsQuery()

	// mutate
	const [updateStatus, { status: statusUpdate, data: dataUpdate }] =
		updateJobApplicationStatusMutation(setToast)
	const [deleteOne, { status: statusDlOne, data: dataDlOne }] =
		deleteJobApplicationMutation(setToast)
	const [deleteMany, { status: statusDlMany, data: dataDlMany }] =
		deleteJobApplicationsMutation(setToast)

	//Setup download csv --------------------------------------------------------
	const headersCSV = [
		{ label: 'id', key: 'id' },
		{ label: 'candidate name', key: 'candidateName' },
		{ label: 'candidate email', key: 'candidateEmail' },
		{ label: 'candidate mobile', key: 'candidateMobile' },
		{ label: 'job id', key: 'jobId' },
		{ label: 'job title', key: 'jobTitle' },
		{ label: 'location', key: 'location' },
		{ label: 'skills', key: 'skills' },
		{ label: 'source', key: 'source' },
		{ label: 'status', key: 'status' },
		{ label: 'created at', key: 'createdAt' },
	]

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
		if (statusUpdate == 'success' && dataUpdate) {
			setToast({
				type: statusUpdate,
				msg: dataUpdate.message,
			})
			refetchAllData()
		}
	}, [statusUpdate])

	useEffect(() => {
		if (statusDlOne == 'success' && dataDlOne) {
			setToast({
				type: statusDlOne,
				msg: dataDlOne.message,
			})
			refetchAllData()
		}
	}, [statusDlOne])

	useEffect(() => {
		if (statusDlMany == 'success' && dataDlMany) {
			setToast({
				type: statusDlMany,
				msg: dataDlMany.message,
			})
			setDataSl([])
			refetchAllData()
		}
	}, [statusDlMany])

	useEffect(() => {
		if (dataAllJobApplications) {
			setIsLoading(false)

			if (dataAllJobApplications.jobApplications) {
				//Set data csv
				const dataCSV: any[] = dataAllJobApplications.jobApplications.map(
					(jobApplication) => ({
						id: jobApplication.id,
						candidateName: jobApplication.name,
						candidateEmail: jobApplication.email,
						candidateMobile: jobApplication.mobile,
						jobId: jobApplication.jobs.id,
						jobTitle: jobApplication.jobs.title,
						location: jobApplication.location.name,
						skills: jobApplication.skills
							? jobApplication.skills.map((skill) => skill.name).toString()
							: '',
						source: jobApplication.source,
						status: jobApplication.status,
						createdAt: jobApplication.createdAt,
					})
				)

				setDataCSV(dataCSV)
			}
		}
	}, [dataAllJobApplications])

	const columns: TColumn[] = jobApplicationColumn({
		colorMode,
		currentUser,
		onChangeStatus: async (id: number, event: any) => {
			setIsLoading(true)
			await updateStatus({
				id,
				status: event.target.value,
			})
		},
		onDelete: (id: number) => {
			setIdJobApplication(id)
			onOpenDl()
		},
		onDetail: (id: number) => {
			setIdJobApplication(id)
			onOpenDetail()
		},
		onUpdate: (id: number) => {
			setIdJobApplication(id)
			onOpenUpdate()
		},
	})

	return (
		<Box pb={8}>
			<Head title="Job applications" />
			<Box className="function">
				<FuncCollapse>
					{currentUser && currentUser.role === 'Admin' && (
						<>
							<Func
								icon={<IoAdd />}
								description={'Add new job by form'}
								title={'Add new'}
								action={onOpenAdd}
							/>

							<CSVLink
								filename={'jobApplications.csv'}
								headers={headersCSV}
								data={dataCSV}
							>
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
								description={'Delete all jobs you selected'}
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
			</Box>

			<Table
				data={dataAllJobApplications?.jobApplications || []}
				columns={columns}
				isLoading={isLoading}
				isSelect={currentUser?.role == 'Admin'}
				selectByColumn="id"
				setSelect={(data: Array<number>) => setDataSl(data)}
				filter={filter}
				isResetFilter={isResetFilter}
			/>

			<Drawer size="xl" title="Add Job Application" onClose={onCloseAdd} isOpen={isOpenAdd}>
				<AddJobApplications onCloseDrawer={onCloseAdd} />
			</Drawer>
			<Drawer size="xl" title="Update Jobs" onClose={onCloseUpdate} isOpen={isOpenUpdate}>
				<UpdateJobApplication
					onCloseDrawer={onCloseUpdate}
					jobApplicationId={idJobApplication}
				/>
			</Drawer>
			<Drawer
				size="xl"
				title="Detail Jobs Application"
				onClose={onCloseDetail}
				isOpen={isOpenDetail}
			>
				<DetailJobApplication
					onCloseDrawer={onCloseDetail}
					jobApplicationId={idJobApplication}
				/>
			</Drawer>

			{/* alert dialog when delete one */}
			<AlertDialog
				handleDelete={() => {
					setIsLoading(true)
					deleteOne(String(idJobApplication))
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
						deleteMany({
							jobApplications: dataSl,
						})
					}
				}}
				title="Are you sure to delete all?"
				content="You will not be able to recover the deleted record!"
				isOpen={isOpenDialogDlMany}
				onClose={onCloseDlMany}
			/>

			<Drawer
				footer={
					<Button
						onClick={() => {
							setIsReset(true)
							setTimeout(() => {
								setIsReset(false)
							}, 1000)
						}}
					>
						Reset
					</Button>
				}
				size="xs"
				title="Filter"
				isOpen={isOpenFilter}
				onClose={onCloseFilter}
			>
				<VStack spacing={5} p={6}>
					<Input
						handleSearch={(data: IFilter) => {
							setFilter(data)
						}}
						columnId={'name'}
						label="Name"
						placeholder="Enter name"
						required={false}
						icon={<AiOutlineSearch fontSize={'20px'} color="gray" opacity={0.6} />}
						type={'text'}
					/>

					<FSelect
						options={dataJobApplicationStatus}
						handleSearch={(data: IFilter) => {
							setFilter(data)
						}}
						columnId={'status'}
						label="Status"
						placeholder="Select status"
						required={false}
					/>

					<FSelect
						options={dataAllLocations?.locations?.map((e) => {
							return {
								label: e.name,
								value: e.name,
							}
						})}
						handleSearch={(data: IFilter) => {
							setFilter(data)
						}}
						columnId={'location'}
						label="Location"
						placeholder="Select location"
						required={false}
					/>

					<FSelect
						options={dataAllJobs?.jobs?.map((e) => {
							return {
								label: e.title,
								value: e.id,
							}
						})}
						handleSearch={(data: IFilter) => {
							setFilter(data)
						}}
						columnId={'jobs'}
						label="Job"
						placeholder="Select job"
						required={false}
					/>

					<DateRange
						handleSelect={(date: { from: Date; to: Date }) => {
							setFilter({
								columnId: 'createdAt',
								filterValue: date,
							})
						}}
						label="Select date"
					/>
				</VStack>
			</Drawer>
		</Box>
	)
}
jobApplications.getLayout = ClientLayout

export default jobApplications
