import { Avatar, Box, Button, HStack, Text, useDisclosure, VStack } from '@chakra-ui/react'
import DiscussionItem from 'components/Discussion'
import Loading from 'components/Loading'
import { AuthContext } from 'contexts/AuthContext'
import {
	createDiscussionMutation,
	deleteDiscussionMutation,
	updateDiscussionMutation,
} from 'mutations/discussion'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { allDiscussionsQuery } from 'queries/discussion'
import { useContext, useEffect, useState } from 'react'
import { AiOutlinePlusCircle, AiOutlineSend } from 'react-icons/ai'
import 'react-quill/dist/quill.bubble.css'
import 'react-quill/dist/quill.snow.css'
import { updateDiscussionForm } from 'type/form/basicFormType'
import { GetStaticPaths, GetStaticProps } from 'next'
import { contractMutaionResponse } from 'type/mutationResponses'
import { NextLayout } from 'type/element/layout'
import { ContractLayout } from 'components/layouts/Contract'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

const Discussion:NextLayout = ()=> {
	const { isAuthenticated, handleLoading, setToast, currentUser, socket } =
		useContext(AuthContext)
	const router = useRouter()
	const { discussionId } = router.query

	//state ---------------------------------------------------------------------
	const [content, setContent] = useState<string>('')

	//Setup disclosure -----------------------------------------------------------
	const { isOpen: isOpenAdd, onOpen: onOpenAdd, onClose: onCloseAdd } = useDisclosure()

	//Query ----------------------------------------------------------------------
	const { data: dataAllDiscussion, mutate: refetchAllDiscussions } = allDiscussionsQuery(
		isAuthenticated,
		Number(discussionId)
	)
	console.log(dataAllDiscussion)

	//mutation -------------------------------------------------------------------
	const [mutateCreDiscussion, { status: statusCreDiscussion, data: dataCreDiscussion }] =
		createDiscussionMutation(setToast)

	const [mutateDeleteDiscussion, { status: statusDeleteDiscussion, data: dataDeleteDiscussion }] =
		deleteDiscussionMutation(setToast)

	const [mutateUpDiscussion, { status: statusUpDiscussion, data: dataUpDiscussion }] =
		updateDiscussionMutation(setToast)

	//User effect ---------------------------------------------------------------
	//Join room socket
	useEffect(() => {
		//Join room
		if (socket && discussionId) {
			socket.emit('joinRoomDiscussionContract', discussionId)

			socket.on('getNewDiscussion', () => {
				refetchAllDiscussions()
			})
		}

		//Leave room
		function leaveRoom() {
			if (socket && discussionId) {
				socket.emit('leaveRoomDiscussionContract', discussionId)
			}
		}

		return leaveRoom
	}, [socket, discussionId])

	//Handle check loged in
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
		if (statusCreDiscussion === 'success') {
			setToast({
				type: 'success',
				msg: dataCreDiscussion?.message as string,
			})

			setContent('')

			refetchAllDiscussions()

			//Emit to other user join room
			if (socket && discussionId) {
				socket.emit('newDiscussion', discussionId)
			}
		}
	}, [statusCreDiscussion])

	//Note when request delete success
	useEffect(() => {
		if (statusDeleteDiscussion === 'success') {
			setToast({
				type: 'success',
				msg: dataDeleteDiscussion?.message as string,
			})

			refetchAllDiscussions()

			//Emit to other user join room
			if (socket && discussionId) {
				socket.emit('newDiscussion', discussionId)
			}
		}
	}, [statusDeleteDiscussion])

	//Note when request update success
	useEffect(() => {
		if (statusUpDiscussion === 'success') {
			setToast({
				type: 'success',
				msg: dataUpDiscussion?.message as string,
			})

			refetchAllDiscussions()

			//Emit to other user join room
			if (socket && discussionId) {
				socket.emit('newDiscussion', discussionId)
			}
		}
	}, [statusUpDiscussion])

	//function ------------------------------------------------------------------
	const onChangeContent = (value: string) => {
		setContent(value)
	}

	//Handle create discussion
	const onCreDiscussion = () => {
		if (!currentUser) {
			setToast({
				msg: 'Please login first',
				type: 'warning',
			})
		} else {
			if (!content) {
				setToast({
					msg: 'Please enter field content',
					type: 'warning',
				})
			} else {
				mutateCreDiscussion({
					content,
					...(currentUser.role === 'Client'
						? { client: currentUser.id }
						: {
								employee: currentUser.id,
						  }),
					contract: Number(discussionId),
				})
			}
		}
	}

	//Handle delete discussion
	const onDeleteDiscussion = (discussionId: string) => {
		mutateDeleteDiscussion({ discussionId })
	}

	//Handle update discussion
	const onUpdateDiscussion = ({ content, discussionId, email_author }: updateDiscussionForm) => {
		if (!content) {
			setToast({
				msg: 'Pleser enter field content',
				type: 'warning',
			})
		} else {
			mutateUpDiscussion({
				content,
				discussionId,
				email_author,
			})
		}
	}

	return (
		<Box p={10} bgColor={'#f2f4f7'} minHeight={'100vh'}>
			<VStack align={'start'} w="full" bgColor={'white'} p={5} borderRadius={5} spacing={5}>
				<Text fontSize={18} fontWeight={'semibold'}>
					Discussion
				</Text>

				<Box position={'relative'} p={2} w={'full'}>
					{isOpenAdd ? (
						<VStack w={'full'} spacing={5} position={'relative'}>
							<HStack w={'full'} align={'start'}>
								{currentUser && (
									<Avatar name={currentUser.name} src={currentUser.avatar?.url} />
								)}
								<ReactQuill
									style={{
										width: '100%',
									}}
									placeholder="Enter you text"
									modules={{
										toolbar: [
											['bold', 'italic', 'underline', 'strike'], // toggled buttons
											['blockquote', 'code-block'],

											[{ header: 1 }, { header: 2 }], // custom button values
											[{ list: 'ordered' }, { list: 'bullet' }],
											[{ script: 'sub' }, { script: 'super' }], // superscript/subscript
											[{ indent: '-1' }, { indent: '+1' }], // outdent/indent
											[{ direction: 'rtl' }], // text direction

											[{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
											[{ header: [1, 2, 3, 4, 5, 6, false] }],

											[{ color: [] }, { background: [] }], // dropdown with defaults from theme
											[{ font: [] }],
											[{ align: [] }],

											['clean'], // remove formatting button
										],
									}}
									value={content}
									onChange={onChangeContent}
								/>
							</HStack>

							<HStack w={'full'} justify={'end'}>
								<Button onClick={onCloseAdd} variant={'ghost'}>
									Cancel
								</Button>
								<Button
									colorScheme={'teal'}
									rightIcon={<AiOutlineSend />}
									onClick={onCreDiscussion}
								>
									Submit
								</Button>
							</HStack>
						</VStack>
					) : (
						<Button
							leftIcon={<AiOutlinePlusCircle />}
							variant="ghost"
							color={'blue.400'}
							_hover={{
								color: 'black',
							}}
							onClick={onOpenAdd}
						>
							Add Comment
						</Button>
					)}

					{statusCreDiscussion === 'running' && <Loading />}
				</Box>

				<VStack
					paddingX={2}
					paddingY={5}
					align={'start'}
					spacing={5}
					position={'relative'}
					w={'full'}
				>
					{dataAllDiscussion?.discussions &&
						currentUser &&
						dataAllDiscussion.discussions.map((discussion) => (
							<DiscussionItem
								currentUser={currentUser}
								discussion={discussion}
								onDeleteDiscussion={onDeleteDiscussion}
								onUpdateDiscussion={onUpdateDiscussion}
							/>
						))}

					{(statusUpDiscussion === 'running' || statusDeleteDiscussion === 'running') && (
						<Loading />
					)}
				</VStack>
			</VStack>
		</Box>
	)
}

export const getStaticProps: GetStaticProps = async () => {
	return {
		props: {},
		// Next.js will attempt to re-generate the page:
		// - When a request comes in
		// - At most once every 10 seconds
		revalidate: 10, // In seconds
	}
}

export const getStaticPaths: GetStaticPaths = async () => {
	const res: contractMutaionResponse = await fetch('http://localhost:4000/api/contracts').then((result) => result.json())
	const contracts = res.contracts

	if(!contracts){
		return { paths: [], fallback: false }
	}

	// Get the paths we want to pre-render based on leave
	const paths = contracts.map((contract: any) => ({
		params: { discussionId: String(contract.id) },
	}))

	// We'll pre-render only these paths at build time.
	// { fallback: blocking } will server-render pages
	// on-demand if the path doesn't exist.
	return { paths, fallback: false }
}

Discussion.getLayout = ContractLayout

export default Discussion