import { Avatar, Box, Grid, GridItem, HStack, Stack, Text, useColorMode, VStack } from '@chakra-ui/react'
import { Donut } from 'components/charts'
import { Empty, Head, Static } from 'components/common'
import { EmployeeLayout } from 'components/layouts/Employee'
import { AuthContext } from 'contexts/AuthContext'

import { useRouter } from 'next/router'
import {
	countProjectsEmployeeQuery,
	countTasksStatusEmployeeQuery,
	detailEmployeeQuery,
	hoursLoggedEmployeeQuery,
	lateAttendanceEmployeeQuery,
	leavesTakenEmployeeQuery,
	openTasksEmployeeQuery
} from 'queries'
import { useContext, useEffect } from 'react'
import { AiOutlineProject } from 'react-icons/ai'
import { BiTime } from 'react-icons/bi'
import { BsCheck2 } from 'react-icons/bs'
import { VscTasklist } from 'react-icons/vsc'
import { SWRConfig } from 'swr'
import { NextLayout } from 'type/element/layout'
import { employeeMutationResponse } from 'type/mutationResponses'

export const DetailEmployee: NextLayout | any = ({
	dataDetailEmployee,
	employeeIdProp,
}: {
	dataDetailEmployee: employeeMutationResponse
	employeeIdProp?: string | number
}) => {
	const {colorMode} = useColorMode()
	const { isAuthenticated, handleLoading } = useContext(AuthContext)
	const router = useRouter()
	const { employeeId } = router.query

	//Query -------------------------------------------------------------------------------------------------
	const { data: dataEmployee } = detailEmployeeQuery(isAuthenticated, employeeId as string)

	const { data: openTasksEmployee } = openTasksEmployeeQuery(
		isAuthenticated,
		(employeeId as string) || employeeIdProp
	)

	const { data: hoursLoggedEmployee } = hoursLoggedEmployeeQuery(
		isAuthenticated,
		(employeeId as string) || employeeIdProp
	)

	const { data: countProjectsEmployee } = countProjectsEmployeeQuery(
		isAuthenticated,
		(employeeId as string) || employeeIdProp
	)

	const { data: countLateAttendancesEmployee } = lateAttendanceEmployeeQuery(
		isAuthenticated,
		(employeeId as string) || employeeIdProp
	)

	const { data: countTasksStatus } = countTasksStatusEmployeeQuery(
		isAuthenticated,
		(employeeId as string) || employeeIdProp
	)

	const { data: countLeavesTakenEmployee } = leavesTakenEmployeeQuery(
		isAuthenticated,
		employeeId as string
	)

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

	//Url initial query detail employee
	const urlDetailEmployee = `employees/${employeeId}`

	return (
		<>
			<SWRConfig
				value={{
					fallback: { [urlDetailEmployee]: dataDetailEmployee },
				}}
			>
				<Head title={dataEmployee?.employee?.name} />

				<Box w="full" pb={8}>
					<VStack spacing={5} alignItems={'start'} w={'full'}>
						<HStack spacing={5} h={'full'} w={'full'}>
							<Avatar
								name={dataEmployee?.employee?.name}
								src={dataEmployee?.employee?.avatar?.url}
								size={'lg'}
							/>
							<VStack spacing={'1px'} align={'start'} height={'full'}>
								<Text fontSize={'20px'} fontWeight={'semibold'}>
									{dataEmployee?.employee?.name}
								</Text>
								<Text color={'gray.400'}>{dataEmployee?.employee?.role}</Text>
							</VStack>
						</HStack>

						<Stack
							direction={['column', null, null, null, 'row']}
							alignItems={'start'}
							spacing={5}
							w={'full'}
						>
							<VStack w={'400px'} minW={'400px'} alignItems={'start'} spacing={4}>
								<Text fontWeight={'semibold'} fontSize={'20px'}>
									Profile Info
								</Text>
								<Grid templateColumns="repeat(3, 1fr)" gap={6} w={'full'}>
									<GridItem colSpan={[3, 1]}>
										<Text color={'gray.400'}>Employee ID</Text>
									</GridItem>
									<GridItem colSpan={[3, 2]}>
										<Text>{dataEmployee?.employee?.employeeId}</Text>
									</GridItem>
									<GridItem colSpan={[3, 1]}>
										<Text color={'gray.400'}>Full Name</Text>
									</GridItem>
									<GridItem colSpan={[3, 2]}>
										<Text>{dataEmployee?.employee?.name}</Text>
									</GridItem>
									<GridItem colSpan={[3, 1]}>
										<Text color={'gray.400'}>Email</Text>
									</GridItem>
									<GridItem colSpan={[3, 2]}>
										<Text>{dataEmployee?.employee?.email}</Text>
									</GridItem>
									<GridItem colSpan={[3, 1]}>
										<Text color={'gray.400'}>Designation</Text>
									</GridItem>
									<GridItem colSpan={[3, 2]}>
										<Text>
											{dataEmployee?.employee?.designation?.name || '--'}
										</Text>
									</GridItem>
									<GridItem colSpan={[3, 1]}>
										<Text color={'gray.400'}>Department</Text>
									</GridItem>
									<GridItem colSpan={[3, 2]}>
										<Text>
											{dataEmployee?.employee?.department?.name || '--'}
										</Text>
									</GridItem>
									<GridItem colSpan={[3, 1]}>
										<Text color={'gray.400'}>Mobile</Text>
									</GridItem>
									<GridItem colSpan={[3, 2]}>
										<Text>{dataEmployee?.employee?.mobile || '--'}</Text>
									</GridItem>
									<GridItem colSpan={[3, 1]}>
										<Text color={'gray.400'}>Gender</Text>
									</GridItem>
									<GridItem colSpan={[3, 2]}>
										<Text>{dataEmployee?.employee?.gender || '--'}</Text>
									</GridItem>
									<GridItem colSpan={[3, 1]}>
										<Text color={'gray.400'}>Joining Date</Text>
									</GridItem>
									<GridItem colSpan={[3, 2]}>
										<Text>{dataEmployee?.employee?.joining_date || '--'}</Text>
									</GridItem>
									<GridItem colSpan={[3, 1]}>
										<Text color={'gray.400'}>Date Of Birth</Text>
									</GridItem>
									<GridItem colSpan={[3, 2]}>
										<Text>{dataEmployee?.employee?.date_of_birth || '--'}</Text>
									</GridItem>
									<GridItem colSpan={[3, 1]}>
										<Text color={'gray.400'}>Hourly Rate</Text>
									</GridItem>
									<GridItem colSpan={[3, 2]}>
										<Text>{dataEmployee?.employee?.hourly_rate}$</Text>
									</GridItem>
									<GridItem colSpan={[3, 1]}>
										<Text color={'gray.400'}>Address</Text>
									</GridItem>
									<GridItem colSpan={[3, 2]}>
										<Text>{dataEmployee?.employee?.address || '--'}</Text>
									</GridItem>
									<GridItem colSpan={[3, 1]}>
										<Text color={'gray.400'}>Skill</Text>
									</GridItem>
									<GridItem colSpan={[3, 2]}>
										<Text>
											{dataEmployee?.employee?.skills?.toString() || '--'}
										</Text>
									</GridItem>
								</Grid>
							</VStack>

							<VStack alignItems={'start'} spacing={10} w={'full'}>
								<VStack alignItems={'start'} spacing={4} w={'full'}>
									<Text fontWeight={'semibold'} fontSize={'20px'}>
										Static
									</Text>
									<Grid
										templateColumns={[
											'repeat(1, 1fr)',
											null,
											null,
											null,
											null,
											'repeat(2, 1fr)',
										]}
										gap={6}
										w={'full'}
									>
										<Static
											title={'Open tasks'}
											text={openTasksEmployee?.countOpentasks}
											icon={<VscTasklist color={colorMode == 'dark' ? 'black': undefined} fontSize={20} />}
											color={'Green'}
										/>

										<Static
											title={'Projects'}
											text={countProjectsEmployee?.countProjects}
											icon={<AiOutlineProject color={colorMode == 'dark' ? 'black': undefined} fontSize={20} />}
											color={'Pink'}
										/>
										<Static
											title={'Hours Logged'}
											text={`${hoursLoggedEmployee?.hoursLogged || 0} Hrs`}
											icon={<BiTime color={colorMode == 'dark' ? 'black': undefined} fontSize={20} />}
											color={'Lam'}
										/>
										<Static
											title={'Late Attendance'}
											text={countLateAttendancesEmployee?.lateAttendance}
											icon={<BsCheck2 color={colorMode == 'dark' ? 'black': undefined} fontSize={20} />}
											color={'Green'}
										/>

										<Static
											title={'Leave taken'}
											text={countLeavesTakenEmployee?.countLeavesTaken}
											icon={<AiOutlineProject color={colorMode == 'dark' ? 'black': undefined} fontSize={20} />}
											color={'Pink'}
										/>
									</Grid>
								</VStack>
								<Grid templateColumns="repeat(2, 1fr)" gap={6} w={'full'}>
									<GridItem borderRadius={5} colSpan={[2, null, null, null, null, 1]}>
										<VStack spacing={'4'} alignItems={'start'} w={'full'}>
											<Text fontWeight={'semibold'} fontSize={'xl'}>
												Tasks
											</Text>
											<Box
												id={'hoang'}
												w={'full'}
												padding={'20px'}
												bg={colorMode == 'light'? '#fafafa': '#1e2636'}
												borderRadius={'10px'}
												h={'300px'}
											>
												{countTasksStatus?.countTasksStatus && countTasksStatus.countTasksStatus.length > 0 ? (
													<Donut
														labels={countTasksStatus.countTasksStatus.map(
															(task: any) => {
																return task.title
															}
														)}
														colors={countTasksStatus.countTasksStatus.map(
															(task: any) => {
																return task.color
															}
														)}
														data={countTasksStatus.countTasksStatus.map(
															(task: any) => {
																return Number(task.count)
															}
														)}
														height={300}
													/>
												): <Empty height='220px'/>}
											</Box>
										</VStack>
									</GridItem>
								</Grid>
							</VStack>
						</Stack>
					</VStack>
				</Box>
			</SWRConfig>
		</>
	)
}

// export const getServerSideProps: GetServerSideProps = async (context) => {
// 	const res: authMutationResponse = await fetch(
// 		`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh_token`,
// 		{
// 			headers: context.req.headers as HeadersInit,
// 		}
// 	).then((result) => result.json())

// 	//get detail employee
// 	const queryEmployee: employeeMutationResponse = await fetch(
// 		`${process.env.NEXT_PUBLIC_API_URL}/api/employees/${context.query.employeeId}`,
// 		{
// 			headers: {
// 				Authorization: `bearer ${res.accessToken}`,
// 				...(context.req.headers as HeadersInit),
// 			},
// 		}
// 	).then((result) => result.json())

// 	if (!queryEmployee.employee) {
// 		return {
// 			notFound: true,
// 		}
// 	}

// 	return {
// 		props: { dataDetailEmployee: queryEmployee }, // will be passed to the page component as props
// 	}
// }

DetailEmployee.getLayout = EmployeeLayout
export default DetailEmployee
