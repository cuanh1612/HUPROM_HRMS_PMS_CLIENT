import {
	Box,
	Button,
	Grid,
	GridItem,
	Radio,
	RadioGroup,
	Stack,
	Text,
	useDisclosure,
	VStack,
} from '@chakra-ui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import { MultiDatePicker, Select, Textarea } from 'components/form'
import { Loading } from 'components/common'
import Modal from 'components/modal/Modal'
import { AuthContext } from 'contexts/AuthContext'
import { createLeaveMutation } from 'mutations'
import { useRouter } from 'next/router'
import { allEmployeesQuery, allLeaveTypesQuery } from 'queries'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { AiOutlineCheck } from 'react-icons/ai'
import { BsCalendarDate } from 'react-icons/bs'
import { mutate } from 'swr'
import { IOption } from 'type/basicTypes'
import { createLeaveForm } from 'type/form/basicFormType'
import { dataStatusLeave } from 'utils/basicData'
import { CreateLeaveValidate } from 'utils/validate'
import AddLeaveType from '../leave-types'

export interface IAddLeavesProps {
	onCloseDrawer?: () => void
}

export default function AddLeaves({ onCloseDrawer }: IAddLeavesProps) {
	const { isAuthenticated, handleLoading, setToast } = useContext(AuthContext)
	const router = useRouter()

	//State ---------------------------------------------------------------------
	const [optionEmployees, setOptionEmployees] = useState<IOption[]>([])
	const [optionLeaveTypes, setOptionLeaveTypes] = useState<IOption[]>([])
	const [duration, setDuration] = useState<string>('Single')

	//Setup modal ----------------------------------------------------------------
	const {
		isOpen: isOpenLeaveType,
		onOpen: onOpenLeaveType,
		onClose: onCloseLeaveType,
	} = useDisclosure()

	//Query ---------------------------------------------------------------------
	const { data: dataEmployees } = allEmployeesQuery(isAuthenticated)
	const { data: dataLeaveTypes } = allLeaveTypesQuery()

	//mutation ------------------------------------------------------------------
	const [mutateCreateLeave, { status: statusLeave, data: dataLeave }] =
		createLeaveMutation(setToast)

	// setForm and submit form create new leave -------------------------------
	const formSetting = useForm<createLeaveForm>({
		defaultValues: {
			employee: '',
			leave_type: '',
			status: '',
			reason: '',
			dates: [],
		},
		resolver: yupResolver(CreateLeaveValidate),
	})

	const { handleSubmit } = formSetting

	const onSubmit = (values: createLeaveForm) => {
		values.duration = duration
		mutateCreateLeave(values)
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

	//Set options select employees
	useEffect(() => {
		if (dataEmployees?.employees) {
			const newOptionEmployees: IOption[] = dataEmployees.employees.map((employee) => {
				return {
					value: employee.id.toString(),
					label: employee.email,
				}
			})

			setOptionEmployees(newOptionEmployees)
		}
	}, [dataEmployees])

	//Set options select leave type
	useEffect(() => {
		if (dataLeaveTypes?.leaveTypes) {
			const newOptionLeaveTypes: IOption[] = dataLeaveTypes.leaveTypes.map((leaveType) => {
				return {
					value: leaveType.id.toString(),
					label: leaveType.name,
				}
			})

			setOptionLeaveTypes(newOptionLeaveTypes)
		}
	}, [dataLeaveTypes])

	//Note when request success
	useEffect(() => {
		if (statusLeave === 'success') {
			//Close drawer when using drawer
			if (onCloseDrawer) {
				onCloseDrawer()
				mutate('leaves')
			}

			setToast({
				type: statusLeave,
				msg: dataLeave?.message as string,
			})
		}
	}, [statusLeave])

	return (
		<>
			<Box pos="relative" p={6} as={'form'} h="auto" onSubmit={handleSubmit(onSubmit)}>
				<Grid templateColumns="repeat(2, 1fr)" gap={6}>
					<GridItem w="100%" colSpan={[2, 1]}>
						<Select
							name="employee"
							label="Choose Member"
							required
							form={formSetting}
							placeholder={'Select Member'}
							options={optionEmployees}
						/>
					</GridItem>

					<GridItem w="100%" colSpan={[2, 1]}>
						<Select
							name="leave_type"
							label="Leave Type"
							required
							form={formSetting}
							placeholder={'Select Leave Type'}
							options={optionLeaveTypes}
							isModal={true}
							onOpenModal={onOpenLeaveType}
						/>
					</GridItem>
					<GridItem w="100%" colSpan={[2, 1]}>
						<Select
							name="status"
							label="Leave Status"
							required
							form={formSetting}
							placeholder={'Select Leave Status'}
							options={ dataStatusLeave}
						/>
					</GridItem>

					<GridItem w="100%" colSpan={[2, 1]}>
						<MultiDatePicker
							name="dates"
							label="Select dates"
							required
							form={formSetting}
							placeholder={'Select Member'}
							icon={<BsCalendarDate />}
						/>
					</GridItem>

					<GridItem w="100%" colSpan={[2, 1]}>
						<VStack align={'start'}>
							<Text>Select Duration</Text>
							<RadioGroup onChange={setDuration} value={duration}>
								<Stack direction="row">
									<Radio value="Single">Single</Radio>
									<Radio value="Half Day">Half Day</Radio>
								</Stack>
							</RadioGroup>
						</VStack>
					</GridItem>

					<GridItem w="100%" colSpan={2}>
						<Textarea
							name="reason"
							label="Reason for absence"
							placeholder="e.g.Feeling not well"
							form={formSetting}
							required
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

				{statusLeave === 'running' && <Loading />}
			</Box>

			{/* Modal Leave type */}
			<Modal
				size="3xl"
				isOpen={isOpenLeaveType}
				onOpen={onOpenLeaveType}
				onClose={onCloseLeaveType}
				title="Add New Leave Type"
			>
				<AddLeaveType />
			</Modal>
		</>
	)
}
