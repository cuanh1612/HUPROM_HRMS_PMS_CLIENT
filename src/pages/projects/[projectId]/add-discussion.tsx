import { Box, Button, Grid, GridItem, Text, VStack } from '@chakra-ui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import { Editor, Loading } from 'components/common'
import { Input, Select } from 'components/form'
import { AuthContext } from 'contexts/AuthContext'
import { createProjectDiscussionRoomMutation } from 'mutations'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { allProjectDiscussionCategoryQuery, allProjectDiscussionRoomsQuery } from 'queries'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { AiOutlineCheck } from 'react-icons/ai'
import { MdOutlineDriveFileRenameOutline } from 'react-icons/md'
import 'react-quill/dist/quill.bubble.css'
import 'react-quill/dist/quill.snow.css'
import { IOption } from 'type/basicTypes'
import {
	createProDiscussionCategoryForm,
	createProjectDiscussionRoomForm
} from 'type/form/basicFormType'
import { projectMutationResponse } from 'type/mutationResponses'
import { CreateProjectDiscussionRoomValidate } from 'utils/validate'

export interface IAddDiscussionProps {
	onCloseModal?: () => void
}


export default function AddDiscussion({onCloseModal}: IAddDiscussionProps) {
	const { isAuthenticated, handleLoading, setToast, socket } = useContext(AuthContext)
	const router = useRouter()
	const { projectId } = router.query

	//State -------------------------------------------------------------
	const [description, setDescription] = useState<string>('')
	const [optionDiscussionCategories, setOptionDiscussionCategories] = useState<IOption[]>([])

	//Query ----------------------------------------------------------------------
	const { data: dataAllDiscussionCategories } = allProjectDiscussionCategoryQuery(isAuthenticated)

	const { mutate: refetchAllDiscussionRooms } = allProjectDiscussionRoomsQuery(
		isAuthenticated,
		Number(projectId)
	)

	//Mutation -----------------------------------------------------------
	const [
		mutateCreProjectDiscussionRoomType,
		{ status: statusCreProjectDiscussionRoomType, data: dataCreProjectDiscussionRoomType },
	] = createProjectDiscussionRoomMutation(setToast)

	// setForm and submit form create new project discussion room --------
	const formSetting = useForm<createProjectDiscussionRoomForm>({
		defaultValues: {
			project_discussion_category: undefined,
			title: '',
		},
		resolver: yupResolver(CreateProjectDiscussionRoomValidate),
	})

	const { handleSubmit } = formSetting

	//Function -----------------------------------------------------------
	const onSubmitLeaveType = (value: createProDiscussionCategoryForm) => {
		value.description = description
		value.project = Number(projectId)
		mutateCreProjectDiscussionRoomType(value)
	}

	const onChangeDescription = (value: string) => {
		setDescription(value)
	}

	//UseEffect ----------------------------------------------------------
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

	//UseEffect ----------------------------------------------------------
	//Notice when create success
	useEffect(() => {
		switch (statusCreProjectDiscussionRoomType) {
			case 'success':
				if (dataCreProjectDiscussionRoomType) {
					//Notice
					setToast({
						type: 'success',
						msg: dataCreProjectDiscussionRoomType?.message,
					})

					if(onCloseModal){
						onCloseModal()
					}

					if(socket && projectId){
						socket.emit('newProjectDiscussion', projectId)
					}

					//Refetch data all project discussion rooms
					refetchAllDiscussionRooms()
				}
				break

			default:
				break
		}
	}, [statusCreProjectDiscussionRoomType])

	//Set sate option when have data all project discussion categories
	useEffect(() => {
		if (dataAllDiscussionCategories?.projectDiscussionCategories) {
			const newOptionDiscussionCategories: IOption[] =
				dataAllDiscussionCategories.projectDiscussionCategories.map(
					(discussionCategory) => {
						return {
							value: discussionCategory.id,
							label: discussionCategory.name,
						}
					}
				)
			setOptionDiscussionCategories(newOptionDiscussionCategories)
		}
	}, [dataAllDiscussionCategories])

	return (
		<Box>
			<VStack align={'start'}>
				<Box
					as={'form'}
					w="full"
					paddingInline={6}
					onSubmit={handleSubmit(onSubmitLeaveType)}
				>
					<Grid templateColumns="repeat(2, 1fr)" gap={6}>
						<GridItem w="100%" colSpan={[2]}>
							<Select
							
								name="project_discussion_category"
								label="Discussion Category"
								required={true}
								form={formSetting}
								placeholder={'Select Discussion Category'}
								options={optionDiscussionCategories}
							/>
						</GridItem>

						<GridItem w="100%" colSpan={[2]}>
							<Input
								name="title"
								label="Title"
								icon={
									<MdOutlineDriveFileRenameOutline
										fontSize={'20px'}
										color="gray"
										opacity={0.6}
									/>
								}
								form={formSetting}
								placeholder="E.g. Sick, Casual"
								type="text"
								required
							/>
						</GridItem>

						<GridItem w="100%" colSpan={2}>
							<VStack align={'start'}>
								<Text fontWeight={'normal'} color={'gray.400'}>
									Description <span style={{ color: 'red' }}>*</span>
								</Text>
								<Editor note={description} onChangeNote={onChangeDescription}/>
							</VStack>
						</GridItem>
					</Grid>

					<VStack align={'end'}>
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
					</VStack>
					{statusCreProjectDiscussionRoomType === 'running' && <Loading />}
				</Box>
			</VStack>
		</Box>
	)
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	//Get access token
	const getAccessToken: { accessToken: string; code: number; message: string; success: boolean } =
		await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh_token`, {
			method: 'GET',
			headers: {
				cookie: context.req.headers.cookie,
			} as HeadersInit,
		}).then((e) => e.json())

	//Redirect login page when error
	if (getAccessToken.code !== 200) {
		return {
			redirect: {
				destination: '/login',
				permanent: false,
			},
		}
	}

	//Check assigned
	const checkAssignedProject: projectMutationResponse = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${context.query.projectId}/check-asigned`,
		{
			method: 'GET',
			headers: {
				authorization: `Bear ${getAccessToken.accessToken}`,
			} as HeadersInit,
		}
	).then((e) => e.json())

	if (!checkAssignedProject.success) {
		return {
			notFound: true,
		}
	}

	return {
		props: {},
	}
}
