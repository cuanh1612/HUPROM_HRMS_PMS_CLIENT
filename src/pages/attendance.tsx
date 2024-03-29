import {
	Avatar,
	Box,
	Button,
	HStack,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	useDisclosure,
	VStack,
	useColorMode,
} from '@chakra-ui/react'
import CheckAttendance from 'components/anttendance/CheckAttendance'
import Dates from 'components/anttendance/Dates'

// custom form
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'

// component to set value form
import { Input, Switch, TimePicker } from 'components/form'

// get layout
import { ClientLayout } from 'components/layouts'

// check authentication
import { AuthContext } from 'contexts/AuthContext'
import { useRouter } from 'next/router'

// query
import {
	allAttendancesQuery,
	allDepartmentsQuery,
	allLeaveQuery,
	allHolidaysQuery,
	allEmployeesNormalQuery,
} from 'queries'

// mutation
import { createAttendanceMutation } from 'mutations'

// hook
import { useContext, useEffect, useState } from 'react'

// type
import { IAttendance } from 'type/element/commom'
import { NextLayout } from 'type/element/layout'
import { AttendanceForm } from 'type/form/basicFormType'
import { employeeType, UserAttendance, IOption } from 'type/basicTypes'

// validate and other functions of time
import { AttendanceValidate } from 'utils/validate'
import { compareTime } from 'utils/time'

import DetailAttendance from 'components/modal/DetailAttendance'
import { Select, SelectCustom } from 'components/filter'
import { IFilter } from 'type/tableTypes'
import { IoAirplaneOutline } from 'react-icons/io5'
import { BiCheck } from 'react-icons/bi'
import { IoMdClose } from 'react-icons/io'
import { AiTwotoneStar } from 'react-icons/ai'
import { Func, FuncCollapse, Head } from 'components/common'
import { VscFilter } from 'react-icons/vsc'
import { Drawer } from 'components/Drawer'
import monthData from 'utils/month.json'

const attendance: NextLayout = () => {
	const { colorMode } = useColorMode()

	// check authenticate
	const { isAuthenticated, handleLoading, setToast, currentUser } = useContext(AuthContext)

	const router = useRouter()

	// get date to filter
	const [dateFilter, setDateFilter] = useState(new Date())

	// get info user to check attendance
	const [user, setUser] = useState<UserAttendance>()

	// get last day
	const [lastDate, setLastDate] = useState(0)

	// set departments to select
	const [departments, setDepartments] = useState<IOption[]>([])

	// get department id to filter
	const [departmentSl, setDepartmentSl] = useState<string>()

	// set employees to select
	const [employees, setEmployees] = useState<IOption[]>([])

	// get employee id to filter
	const [employeeSl, setEmployeeSl] = useState<string | undefined>()

	// set open modal to check attendance
	const { isOpen: isOpenInsert, onOpen: onOpenInsert, onClose: onCloseInsert } = useDisclosure()

	// set open modal to check attendance
	const { isOpen: isOpenDetail, onOpen: onOpenDetail, onClose: onCloseDetail } = useDisclosure()

	// set open modal to check filter
	const { isOpen: isOpenFilter, onOpen: onOpenFilter, onClose: onCloseFilter } = useDisclosure()

	// get all attendances
	const { data: allAttendances, mutate: refetchAttendances } = allAttendancesQuery(
		isAuthenticated,
		dateFilter,
		departmentSl,
		currentUser?.role === 'Admin' ? employeeSl : currentUser?.id
	)

	// get all employees
	const { data: allEmployees } = allEmployeesNormalQuery(isAuthenticated)

	// get all attendance
	const { data: allDepartments } = allDepartmentsQuery(isAuthenticated)

	// get all leaves
	const { data: allLeaves } = allLeaveQuery({
		isAuthenticated,
		date: dateFilter,
	})

	// get all holiday
	const { data: allHolidays } = allHolidaysQuery({})

	// function to reset form
	const resetForm = () => ({
		late: false,
		half_day: false,
		working_from: '',
		clock_in_time: '',
		clock_out_time: '',
	})

	// setForm and submit form ----------------------------------------------------------
	const formSetting = useForm<AttendanceForm>({
		defaultValues: resetForm(),
		resolver: yupResolver(AttendanceValidate),
	})

	const { handleSubmit } = formSetting

	// add or update attendance
	const [mutateCorUAttendance, { status, data: dataAttendance }] =
		createAttendanceMutation(setToast)

	const onSubmit = (values: AttendanceForm) => {
		const isOutLessInClock = compareTime(values.clock_in_time, values.clock_out_time)
		if (isOutLessInClock) {
			return setToast({
				type: 'error',
				msg: 'Clock-out time cannot be less than clock-in time',
			})
		}

		const data: AttendanceForm = {
			...values,
			date: user?.date,
			employee: user?.id,
		}
		mutateCorUAttendance(data)
	}

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
			setEmployees(valuesFilter)
		}
	}, [allEmployees, colorMode])

	// set department to filter
	useEffect(() => {
		if (allDepartments?.departments) {
			const valuesFilter = allDepartments.departments.map(
				(department): IOption => ({
					label: department.name,
					value: String(department.id),
				})
			)
			setDepartments(valuesFilter)
		}
	}, [allDepartments])

	// alert when insert attendance successfully
	useEffect(() => {
		if (status == 'success') {
			setToast({
				type: status,
				msg: String(dataAttendance?.message),
			})
			refetchAttendances()
			onCloseInsert()
			resetForm()
		}
	}, [status])

	// check authenticate
	useEffect(() => {
		if (isAuthenticated) {
			handleLoading(false)
		}
		if (isAuthenticated == false) {
			router.push('/login')
		}
	}, [isAuthenticated])

	// get last date in this month
	useEffect(() => {
		var currMonth = dateFilter.getMonth()
		var currYear = dateFilter.getFullYear()
		var newDate = new Date(currYear, currMonth + 1, 0)
		var lastDayOfMonth = newDate.getDate()
		setLastDate(lastDayOfMonth)
	}, [dateFilter])

	// function to set info employee
	const setUserHandle = (date: Date, employee: employeeType) =>
		setUser({
			id: employee.id,
			avatar: employee.avatar?.url as string,
			designation: employee.designation?.name as string,
			name: employee.name,
			date,
		})

	const getYearCurrent = () => {
		return new Date().getFullYear()
	}

	return (
		<Box w={'full'} pb={8}>
			<Head title="Attendances" />
			<Box className="function">
				<FuncCollapse>
					<Func
						icon={<VscFilter />}
						description={'Open draw to filter'}
						title={'filter'}
						action={onOpenFilter}
					/>
				</FuncCollapse>
			</Box>
			<br />
			<VStack spacing={2} justifyContent={'flex-start'} pos="relative" alignItems={'normal'}>
				<HStack flexWrap={'wrap'} spacing={0} className="caption">
					<HStack mr={'20px !important'} mb={'20px !important'}>
						<HStack
							h={'30px'}
							minW={'30px'}
							bg={colorMode == 'dark' ? 'hu-Pink.normalA' : 'hu-Pink.lightA'}
							color={colorMode == 'dark' ? 'white' : 'hu-Pink.normalA'}
							userSelect={'all'}
							aria-label="Search database"
							borderRadius={'5px'}
							justifyContent={'center'}
						>
							<IoAirplaneOutline />
						</HStack>
						<Text color={'gray'}>Leave</Text>
					</HStack>
					<HStack mr={'20px !important'} mb={'20px !important'}>
						<HStack
							h={'30px'}
							minW={'30px'}
							bg={colorMode == 'dark' ? 'hu-Green.normalA' : 'hu-Green.lightA'}
							color={colorMode == 'dark' ? 'white' : 'hu-Green.normalA'}
							userSelect={'all'}
							aria-label="Search database"
							borderRadius={'5px'}
							justifyContent={'center'}
						>
							<BiCheck fontSize={20} />
						</HStack>
						<Text color={'gray'}>Attended</Text>
					</HStack>
					<HStack mr={'20px !important'} mb={'20px !important'}>
						<HStack
							h={'30px'}
							minW={'30px'}
							bg={colorMode == 'dark' ? 'gray' : 'gray.200'}
							color={colorMode == 'dark' ? 'white' : 'gray.500'}
							userSelect={'all'}
							aria-label="Search database"
							borderRadius={'5px'}
							justifyContent={'center'}
						>
							<IoMdClose />
						</HStack>
						<Text color={'gray'}>Not attended yet</Text>
					</HStack>
					<HStack mr={'20px !important'} mb={'20px !important'}>
						<HStack
							h={'30px'}
							minW={'30px'}
							bg={colorMode == 'dark' ? 'yellow.400' : 'yellow.200'}
							color={colorMode == 'dark' ? 'white' : 'yellow.500'}
							userSelect={'all'}
							aria-label="Search database"
							borderRadius={'5px'}
							justifyContent={'center'}
						>
							<AiTwotoneStar />
						</HStack>
						<Text color={'gray'}>Holiday</Text>
					</HStack>
				</HStack>
				<VStack
					className="table"
					paddingBottom={'30px'}
					spacing={5}
					alignItems={'start'}
					overflow={'auto'}
				>
					<HStack spacing={10} alignItems="center" justifyContent={'space-between'}>
						<HStack spacing={10}>
							<Text
								fontSize={'md'}
								color={'hu-GreenN.darkH'}
								fontFamily={'"Montserrat", sans-serif'}
								fontWeight={'semibold'}
								minW={'200px'}
							>
								Employees
							</Text>
							<HStack spacing={5}>
								<Dates countDate={lastDate} />
							</HStack>
						</HStack>
						<Text
							minW={'100px'}
							fontSize={'md'}
							color={'hu-GreenN.darkH'}
							fontFamily={'"Montserrat", sans-serif'}
							fontWeight={'semibold'}
						>
							Total
						</Text>
					</HStack>

					{currentUser &&
						allAttendances?.data.map((employee) => {
							const attendances = employee.attendances.map(
								(attendance): IAttendance => ({
									id: attendance.id,
									date: attendance.date,
									handle: (date: Date) => {
										formSetting.reset({
											clock_in_time: attendance.clock_in_time,
											clock_out_time: attendance.clock_out_time,
											half_day: attendance.half_day,
											late: attendance.late,
											working_from: attendance.working_from,
										})

										setUserHandle(date, employee)
										onOpenDetail()
									},
									id_Employee: employee.id,
								})
							)
							return (
								<HStack
									spacing={10}
									key={employee.id}
									alignItems="center"
									justifyContent={'space-between'}
								>
									<HStack spacing={10}>
										<HStack minW={'200px'} spacing={3}>
											<Avatar
												name={employee.name}
												src={employee.avatar?.url}
												size={'sm'}
											/>
											<Box w={'full'}>
												<Text>{employee.name}</Text>
												{employee.designation && (
													<Text color={'gray'} fontSize={'14px'}>
														{employee.designation.name}
													</Text>
												)}
											</Box>
										</HStack>
										<HStack spacing={5}>
											<CheckAttendance
												createHandle={(date: Date) => {
													formSetting.reset(resetForm())
													setUserHandle(date, employee)
													onOpenInsert()
												}}
												employeeId={employee.id}
												countDate={lastDate}
												attendances={attendances}
												leaveDates={allLeaves?.leaves}
												holidays={allHolidays?.holidays}
												dateFilter={dateFilter}
												isChange={
													currentUser && currentUser.role === 'Admin'
														? true
														: false
												}
											/>
										</HStack>
									</HStack>
									<Box minW={'100px'}>
										<Text
											color={'hu-Green.normal'}
											fontWeight={'semibold'}
											fontSize={'20px'}
											as={'span'}
										>
											{attendances.length}
										</Text>
										<Text
											color={colorMode == 'dark' ? 'gray.200' : 'gray.500'}
											as={'span'}
										>
											{' '}
											/{lastDate}
										</Text>
									</Box>
								</HStack>
							)
						})}

					{/* open modal to add or update attendance */}
					<Modal isOpen={isOpenInsert} onClose={onCloseInsert}>
						<ModalOverlay />
						<ModalContent marginInline={'20px'}>
							<ModalHeader>
								Check attendance{' '}
								<Text as="span" fontWeight={'normal'}>
									{user &&
										new Date(user.date).getDate() +
											'-' +
											(new Date(user.date).getMonth() + 1) +
											'-' +
											new Date(user.date).getFullYear()}
								</Text>
							</ModalHeader>
							<ModalCloseButton />
							<ModalBody>
								<VStack
									as={'form'}
									id="attendance"
									onSubmit={handleSubmit(onSubmit)}
									alignItems={'start'}
									spacing={5}
								>
									{user && (
										<>
											<HStack
												minW={'200px'}
												alignItems={'flex-start'}
												spacing={3}
											>
												<Avatar name={user.name} src={user.avatar} />
												<Box w={'full'}>
													<Text fontWeight={'semibold'}>{user.name}</Text>
													<Text color={'gray'} fontSize={'14px'}>
														{user.designation}
													</Text>
												</Box>
											</HStack>
											<HStack spacing={5}>
												<TimePicker
													form={formSetting}
													label="Clock in"
													name={'clock_in_time'}
													required={true}
													timeInit={
														formSetting.getValues()['clock_in_time']
													}
												/>
												<TimePicker
													form={formSetting}
													label="Clock out"
													name={'clock_out_time'}
													required={true}
													timeInit={
														formSetting.getValues()['clock_out_time']
													}
												/>
											</HStack>
										</>
									)}

									<Input
										placeholder="e.g. Office, Home, etc."
										label={'Working from'}
										name={'working_from'}
										form={formSetting}
									/>
									<HStack spacing={5}>
										<Switch form={formSetting} name="late" label="Late" />
										<Switch
											form={formSetting}
											name="half_day"
											label="Half day"
										/>
									</HStack>
								</VStack>
							</ModalBody>

							<ModalFooter>
								<Button
									colorScheme="red"
									variant={'ghost'}
									mr={3}
									onClick={onCloseInsert}
								>
									Close
								</Button>
								<Button form="attendance" type="submit" colorScheme={'green'}>
									Save
								</Button>
							</ModalFooter>
						</ModalContent>
					</Modal>
					<DetailAttendance
						isOpenDetail={isOpenDetail}
						onCloseDetail={() => onCloseDetail()}
						onOpenInsert={() => onOpenInsert()}
						user={user}
						values={formSetting.getValues()}
					/>
				</VStack>

				{/* filter */}

				<Drawer
					isOpen={isOpenFilter}
					title={'filter'}
					size={'xs'}
					footer={
						<Button
							onClick={() => {
								setEmployeeSl(undefined)
								setDepartmentSl(undefined)
								setDateFilter(new Date())
							}}
						>
							reset
						</Button>
					}
					onClose={onCloseFilter}
				>
					<VStack p={6} spacing={5}>
						<Select
							options={monthData}
							handleSearch={(data: IFilter) => {
								if (!data.filterValue) {
									setDateFilter(
										(date) => new Date(date.setMonth(new Date().getMonth()))
									)
								} else {
									setDateFilter(
										(date) =>
											new Date(date.setMonth(Number(data.filterValue) - 1))
									)
								}
							}}
							columnId={'month'}
							label="Month"
							placeholder="Select month"
						/>

						<Select
							options={[
								{
									label: String(getYearCurrent()),
									value: String(getYearCurrent()),
								},
								{
									label: String(getYearCurrent() - 1),
									value: String(getYearCurrent() - 1),
								},
								{
									label: String(getYearCurrent() - 2),
									value: String(getYearCurrent() - 2),
								},
								{
									label: String(getYearCurrent() - 3),
									value: String(getYearCurrent() - 3),
								},
								{
									label: String(getYearCurrent() - 4),
									value: String(getYearCurrent() - 4),
								},
							]}
							handleSearch={(data: IFilter) => {
								if (!data.filterValue) {
									setDateFilter(
										(date) =>
											new Date(date.setFullYear(new Date().getFullYear()))
									)
								} else {
									setDateFilter(
										(date) =>
											new Date(date.setFullYear(Number(data.filterValue)))
									)
								}
							}}
							columnId={'year'}
							label="Year"
							placeholder="Select year"
						/>
						{currentUser?.role === 'Admin' && departments && (
							<Select
								options={departments}
								handleSearch={(data: IFilter) => {
									if (!data.filterValue) {
										setDepartmentSl(undefined)
									} else {
										setDepartmentSl(data.filterValue)
									}
								}}
								columnId={'department'}
								label="Department"
								placeholder="Select department"
							/>
						)}
						{currentUser?.role === 'Admin' && employees && (
							<SelectCustom
								placeholder="Select employee"
								handleSearch={(field: any) => {
									setEmployeeSl(field.value)
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
									...employees,
								]}
								required={false}
							/>
						)}
					</VStack>
				</Drawer>
			</VStack>
		</Box>
	)
}

attendance.getLayout = ClientLayout

export default attendance
