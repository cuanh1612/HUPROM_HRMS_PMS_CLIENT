import {
	Box,
	Button,
	Checkbox,
	Divider,
	Grid,
	GridItem,
	Text,
	useDisclosure,
	VStack,
} from '@chakra-ui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import {
	Input,
	CountrySelector,
	InputMutiple,
	InputNumber,
	Select,
	UploadAvatar,
	Textarea,
} from 'components/form'
import {Loading} from 'components/common'
import Modal from 'components/modal/Modal'
import { AuthContext } from 'contexts/AuthContext'
import { updateEmployeeMutation } from 'mutations'
import { useRouter } from 'next/router'
import { allDepartmentsQuery, allDesignationsQuery, detailEmployeeQuery } from 'queries'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { AiOutlineCheck, AiOutlineMail, AiOutlinePhone } from 'react-icons/ai'
import { BsCalendarDate } from 'react-icons/bs'
import { MdDriveFileRenameOutline, MdPassword } from 'react-icons/md'
import { departmentType, designationType, IOption } from 'type/basicTypes'
import { ICloudinaryImg, IImg } from 'type/fileType'
import { updateEmployeeForm } from 'type/form/basicFormType'
import { dataGender } from 'utils/basicData'
import { uploadFile } from 'utils/uploadFile'
import { UpdateEmployeeValidate } from 'utils/validate'
import Department from '../departments'
import Designation from '../designations'
import { mutate } from 'swr'

export interface IUpdateEmployeesProps {
	onCloseDrawer?: () => void
	employeeId: number | null
}

export default function UpdateEmployees({ onCloseDrawer, employeeId }: IUpdateEmployeesProps) {
	// const { isOpen, onOpen, onClose } = useDisclosure()
	const { setToast, isAuthenticated, handleLoading } = useContext(AuthContext)
	const router = useRouter()

	//State--------------------------------------------------------------------------------------------------
	const [optionDepartments, setOptionDepartments] = useState<IOption[]>([])
	const [optionDesignations, setOptionDesignations] = useState<IOption[]>([])
	const [advancedInfo, setAdvancedInfo] = useState({
		can_login: false,
		can_receive_email: false,
	})
	const [infoImg, setInfoImg] = useState<IImg>() // state data image upload
	const [loadingImg, setLoadingImg] = useState<boolean>(false) // state loading when image upload

	//Setup modal -------------------------------------------------------------------------------------------
	const {
		isOpen: isOpenDepartment,
		onOpen: onOpenDepartment,
		onClose: onCloseDepartment,
	} = useDisclosure()

	const {
		isOpen: isOpenDesignation,
		onOpen: onOpenDesignation,
		onClose: onCloseDesignation,
	} = useDisclosure()

	//Query -------------------------------------------------------------------------------------------------
	const { data: dataDepartments, error: errorDepartments } = allDepartmentsQuery(isAuthenticated)
	const { data: dataDesignations, error: errorDesignations } =
		allDesignationsQuery(isAuthenticated)
	const { data: dataEmployee, error: errorEmployee } = detailEmployeeQuery(
		isAuthenticated,
		employeeId
	)

	//mutation ----------------------------------------------------------------------------------------------
	const [mutateUpdateEmployee, { status: statusUpdateEmployee, data: dataUpdateEmployee }] =
		updateEmployeeMutation(setToast)

	// setForm and submit form create new employee ----------------------------------------------------------
	const formSetting = useForm<updateEmployeeForm>({
		defaultValues: {
			employeeId: '',
			email: '',
			name: '',
			password: '',
			designation: '',
			department: '',
			hourly_rate: 1,
			gender: '',
			mobile: '',
			country: '',
			address: '',
			skills: [],
		},
		resolver: yupResolver(UpdateEmployeeValidate),
	})

	const { handleSubmit } = formSetting

	//function-------------------------------------------------------------------
	const handleUploadAvatar = async () => {
		if (infoImg) {
			setLoadingImg(true)
			const dataUploadAvatar: Array<ICloudinaryImg> = await uploadFile({
				files: infoImg.files,
				raw: false,
				tags: ['avatar'],
				options: infoImg.options,
				upload_preset: 'huprom-avatar',
			})

			setLoadingImg(false)
			return dataUploadAvatar[0]
		}

		return null
	}

	const onSubmit = async (values: updateEmployeeForm) => {
		// mutateCreateEmployee(values)
		if (!employeeId) {
			setToast({
				type: 'error',
				msg: 'Not found employee to update',
			})
		} else {
			//Upload avatar
			const dataAvatar: ICloudinaryImg | null = await handleUploadAvatar()

			//Set data avatar if upload avatar success
			if (dataAvatar) {
				values.avatar = {
					name: dataAvatar.name,
					public_id: dataAvatar.public_id,
					url: dataAvatar.url,
				}
			}

			//Reset value update
			values.can_login = advancedInfo.can_login
			values.can_receive_email = advancedInfo.can_receive_email

			mutateUpdateEmployee({
				inputUpdate: values,
				employeeId,
			})
		}
	}

	//User effect ---------------------------------------------------------------
	useEffect(() => {
		if (dataDepartments?.departments) {
			const newOptionDepartments: IOption[] = dataDepartments.departments.map(
				(department) => {
					return {
						value: department.id.toString(),
						label: department.name,
					}
				}
			)

			setOptionDepartments(newOptionDepartments)
		}
	}, [dataDepartments])

	useEffect(() => {
		if (dataDesignations?.designations) {
			const newOptionDesignations: IOption[] = dataDesignations.designations.map(
				(designation) => {
					return {
						value: designation.id.toString(),
						label: designation.name,
					}
				}
			)

			setOptionDesignations(newOptionDesignations)
		}
	}, [dataDesignations])

	useEffect(() => {
		if (errorDepartments) {
			setToast({
				type: 'error',
				msg: errorDepartments.response?.data.message,
			})
		}

		if (errorDesignations) {
			setToast({
				type: 'error',
				msg: errorDesignations.response?.data.message,
			})
		}

		if (errorEmployee) {
			setToast({
				type: 'error',
				msg: errorEmployee.response?.data.message,
			})
		}
	}, [errorDepartments, errorDesignations, errorEmployee])

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

	//Setting form when have data detail employee
	useEffect(() => {
		if (dataEmployee?.employee) {
			//Set data advanced
			setAdvancedInfo({
				can_login: dataEmployee.employee.can_login,
				can_receive_email: dataEmployee.employee.can_receive_email,
			})

			//Set data form
			formSetting.reset({
				employeeId: dataEmployee?.employee.employeeId
					? dataEmployee.employee.employeeId.toString()
					: '',
				email: dataEmployee?.employee.email ? dataEmployee.employee.email : '',
				name: dataEmployee?.employee.name ? dataEmployee.employee.name : '',
				password: dataEmployee?.employee.password ? dataEmployee.employee.password : '',
				designation: (dataEmployee?.employee?.designation as designationType)?.id
					? (dataEmployee.employee.designation as designationType).id.toString()
					: '',
				department: (dataEmployee?.employee.department as departmentType)?.id
					? (dataEmployee.employee.department as departmentType).id.toString()
					: '',
				hourly_rate: dataEmployee?.employee.hourly_rate
					? dataEmployee.employee.hourly_rate
					: 1,
				gender: dataEmployee?.employee.gender ? dataEmployee.employee.gender : '',
				mobile: dataEmployee?.employee.mobile ? dataEmployee.employee.mobile : '',
				country: dataEmployee?.employee.country ? dataEmployee.employee.country : '',
				address: dataEmployee?.employee.address ? dataEmployee.employee.address : '',
				skills: dataEmployee?.employee.skills ? dataEmployee.employee.skills : [],
				joining_date: dataEmployee?.employee.joining_date
					? dataEmployee?.employee.joining_date
					: undefined,
				date_of_birth: dataEmployee?.employee.date_of_birth
					? dataEmployee?.employee.date_of_birth
					: undefined,
			})
		}
	}, [dataEmployee])

	// Note when request success
	useEffect(() => {
		if (statusUpdateEmployee === 'success') {
			//Close drawer when using drawer
			if (onCloseDrawer) {
				onCloseDrawer()
			}

			// refetch all employees
			mutate('employees')

			setToast({
				type: statusUpdateEmployee,
				msg: dataUpdateEmployee?.message as string,
			})
		}
	}, [statusUpdateEmployee])

	return (
		<>
			<Box pos="relative" p={6} as={'form'} h="auto" onSubmit={handleSubmit(onSubmit)}>
				<Grid templateColumns="repeat(2, 1fr)" gap={6}>
					<GridItem w="100%" colSpan={2}>
						<UploadAvatar
							setInfoImg={(data?: IImg) => {
								setInfoImg(data)
							}}
							oldImg={dataEmployee?.employee?.avatar?.url}
						/>
					</GridItem>

					<GridItem w="100%" colSpan={[2, 1]}>
						<Input
							name="employeeId"
							label="Employee ID"
							icon={<AiOutlineMail fontSize={'20px'} color="gray" opacity={0.6} />}
							form={formSetting}
							placeholder="Enter employee Id"
							type="text"
							required
						/>
					</GridItem>
					<GridItem w="100%" colSpan={[2, 1]}>
						<Input
							name="name"
							label="Name"
							icon={
								<MdDriveFileRenameOutline
									fontSize={'20px'}
									color="gray"
									opacity={0.6}
								/>
							}
							form={formSetting}
							placeholder="Enter employee name"
							type="text"
							required
						/>
					</GridItem>
					<GridItem w="100%" colSpan={[2, 1]}>
						<Input
							name="email"
							label="Email"
							icon={<AiOutlineMail fontSize={'20px'} color="gray" opacity={0.6} />}
							form={formSetting}
							placeholder="Enter employee email"
							type="email"
							required
						/>
					</GridItem>
					<GridItem w="100%" colSpan={[2, 1]}>
						<Input
							name="password"
							label="Password"
							icon={<MdPassword fontSize={'20px'} color="gray" opacity={0.6} />}
							form={formSetting}
							placeholder="Enter employee password"
							type="password"
						/>
					</GridItem>
					<GridItem w="100%" colSpan={[2, 1]}>
						<Select
							name="designation"
							label="designation"
							required
							form={formSetting}
							placeholder={'Select designation'}
							options={optionDesignations}
							isModal={true}
							onOpenModal={onOpenDesignation}
						/>
					</GridItem>
					<GridItem w="100%" colSpan={[2, 1]}>
						<Select
							name="department"
							label="Department"
							required
							form={formSetting}
							placeholder={'Select department'}
							options={optionDepartments}
							isModal={true}
							onOpenModal={onOpenDepartment}
						/>
					</GridItem>
					<GridItem w="100%" colSpan={[2, 1]}>
						<Input
							name="joining_date"
							label="Joining Date"
							icon={<BsCalendarDate fontSize={'20px'} color="gray" opacity={0.6} />}
							form={formSetting}
							placeholder="Enter employee department"
							type="date"
							required
						/>
					</GridItem>
					<GridItem w="100%" colSpan={[2, 1]}>
						<Input
							name="date_of_birth"
							label="Date Of Birth"
							icon={<BsCalendarDate fontSize={'20px'} color="gray" opacity={0.6} />}
							form={formSetting}
							placeholder="Select date of birth"
							type="date"
						/>
					</GridItem>
					<GridItem w="100%" colSpan={[2, 1]}>
						<InputNumber
							name="hourly_rate"
							label="Hourly Rate ($)"
							form={formSetting}
							required
							min={1}
						/>
					</GridItem>
					<GridItem w="100%" colSpan={[2, 1]}>
						<Select
							name="gender"
							label="Gender"
							required
							form={formSetting}
							placeholder={'Select department'}
							options={dataGender}
						/>
					</GridItem>

					<GridItem w="100%" colSpan={[2, 1]}>
						<CountrySelector name="country" form={formSetting} />
					</GridItem>

					<GridItem w="100%" colSpan={[2, 1]}>
						<Input
							name="mobile"
							label="Mobile"
							icon={<AiOutlinePhone fontSize={'20px'} color="gray" opacity={0.6} />}
							form={formSetting}
							placeholder="Enter mobile"
							type="tel"
							required
						/>
					</GridItem>

					<GridItem w="100%" colSpan={2}>
						<Textarea
							name="address"
							label="Address"
							placeholder="Enter address"
							form={formSetting}
						/>
					</GridItem>

					<GridItem w="100%" colSpan={2}>
						<InputMutiple label="Skills" name="skills" form={formSetting} />
					</GridItem>
				</Grid>

				<Divider marginY={6} />

				<Text fontSize={20} fontWeight={'semibold'}>
					Advanced Info
				</Text>

				<Grid templateColumns="repeat(2, 1fr)" gap={6} mt={6}>
					<GridItem w="100%" colSpan={[2, 1]}>
						<VStack alignItems={'start'}>
							<Checkbox
								colorScheme={'teal'}
								isChecked={advancedInfo.can_login}
								onChange={(e: any) =>
									setAdvancedInfo({
										...advancedInfo,
										can_login: e.currentTarget.checked,
									})
								}
							>
								Can login to app
							</Checkbox>
						</VStack>
					</GridItem>

					<GridItem w="100%" colSpan={[2, 1]}>
						<VStack alignItems={'start'}>
							<Checkbox
								colorScheme={'teal'}
								isChecked={advancedInfo.can_receive_email}
								onChange={(e: any) => {
									setAdvancedInfo({
										...advancedInfo,
										can_receive_email: e.currentTarget.checked,
									})
								}}
							>
								Can receive email notifications
							</Checkbox>
						</VStack>
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
				{(statusUpdateEmployee === 'running' || loadingImg) && <Loading />}
			</Box>

			{/* Modal department and designation */}
			<Modal
				size="3xl"
				isOpen={isOpenDepartment}
				onOpen={onOpenDepartment}
				onClose={onCloseDepartment}
				title="Department"
			>
				<Text>
					<Department />
				</Text>
			</Modal>

			<Modal
				size="3xl"
				isOpen={isOpenDesignation}
				onOpen={onOpenDesignation}
				onClose={onCloseDesignation}
				title="Designation"
			>
				<Text>
					<Designation />
				</Text>
			</Modal>
		</>
	)
}
