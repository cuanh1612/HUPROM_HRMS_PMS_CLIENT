import {
	Box,
	Button,
	Grid,
	GridItem,
	Radio,
	RadioGroup,
	Stack,
	Text,
	useColorMode,
	VStack
} from '@chakra-ui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import { Input } from 'components/form'
import {Editor, Loading} from 'components/common'
import { AuthContext } from 'contexts/AuthContext'
import { createNoticeBoardMutation } from 'mutations'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { AiOutlineCheck } from 'react-icons/ai'
import { BsCardHeading } from 'react-icons/bs'
import { createNoticeBoardForm } from 'type/form/basicFormType'
import { createNoticeBoardValidate } from 'utils/validate'
import { allNoticeBoardQuery } from 'queries'

export interface IAddNoticeBoardProps {
	onCloseDrawer: () => void
}

export default function AddNoticeBoard({ onCloseDrawer }: IAddNoticeBoardProps) {
	const { isAuthenticated, handleLoading, setToast, socket } = useContext(AuthContext)
	const {colorMode} = useColorMode()
	const router = useRouter()

	//State ----------------------------------------------------------------------
	const [detailNotice, setDetailNotice] = useState<string>('')
	const [noticeTo, setNoticeTo] = useState<string>('Employees')

	//mutation -------------------------------------------------------------------
	const [mutateCreNoticeBoard, { status: statusCreNoticeBoard, data: dataCreNoticeBoard }] =
		createNoticeBoardMutation(setToast)

	// refetch all notice
	const { mutate: refetchNotice} = allNoticeBoardQuery(isAuthenticated)
	
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

	//Note when request success
	useEffect(() => {
		if (statusCreNoticeBoard === 'success') {
			//Close drawer when using drawer
			if (onCloseDrawer) {
				onCloseDrawer()
			}

			if(socket){
				socket.emit('newNoticeBoard')
			}

			setToast({
				type: statusCreNoticeBoard,
				msg: dataCreNoticeBoard?.message as string,
			})

			refetchNotice()
		}
	}, [statusCreNoticeBoard])

	// setForm and submit form create new notice -------------------------------
	const formSetting = useForm<createNoticeBoardForm>({
		defaultValues: {
			heading: '',
		},
		resolver: yupResolver(createNoticeBoardValidate),
	})

	const { handleSubmit } = formSetting

	const onSubmit = async (values: createNoticeBoardForm) => {
		//Check value employees
		if (!detailNotice) {
			setToast({
				msg: 'Please enter field detail notice board',
				type: 'warning',
			})
		} else {
			//Create project
			values.details = detailNotice
			values.notice_to = noticeTo
			await mutateCreNoticeBoard(values)
		}
	}

	//Function -------------------------------------------------------------------
	const onChangeDetails = (value: string) => {
		setDetailNotice(value)
	}

	//Handle change notice to radio
	const onChangeNoticeTo = (value: string) => {
		setNoticeTo(value)
	}

	return (
		<>
			<Box pos="relative" p={6} as={'form'} h="auto" onSubmit={handleSubmit(onSubmit)}>
				<Grid templateColumns="repeat(2, 1fr)" gap={6}>
					<GridItem w="100%" colSpan={[2]}>
						<Text fontWeight={'normal'} color={'gray.400'} pb={2}>
							Notice To{' '}
							<Text display={'inline-block'} color={'red'}>
								*
							</Text>
						</Text>
						<RadioGroup onChange={onChangeNoticeTo} value={noticeTo}>
							<Stack direction="row">
								<Radio value="Employees">Employees</Radio>
								<Radio value="Clients">Clients</Radio>
							</Stack>
						</RadioGroup>
					</GridItem>

					<GridItem w="100%" colSpan={[2]}>
						<Input
							name="heading"
							label="Notice Heading"
							icon={<BsCardHeading fontSize={'20px'} color="gray" opacity={0.6} />}
							form={formSetting}
							placeholder="e.g. New year celebrations at office"
							type="text"
							required
						/>
					</GridItem>

					<GridItem w="100%" colSpan={2}>
						<VStack align={'start'}>
							<Text fontWeight={'normal'} color={'gray.400'}>
								Notice Details{' '}
								<Text ml={1} display={'inline-block'} color={colorMode ? 'red.300': 'red.500'}>
									*
								</Text>
							</Text>
							<Editor note={detailNotice} onChangeNote={onChangeDetails}/>
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

				{statusCreNoticeBoard === 'running' && <Loading />}
			</Box>
		</>
	)
}
