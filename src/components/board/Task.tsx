import {
	Avatar,
	AvatarGroup,
	Button,
	HStack,
	Image,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Text,
	useColorMode,
	VStack,
} from '@chakra-ui/react'
import { AuthContext } from 'contexts/AuthContext'
import React, { useContext } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { AiOutlineFile } from 'react-icons/ai'
import { BiMessageDots } from 'react-icons/bi'
import { IoEyeOutline } from 'react-icons/io5'
import { MdOutlineDeleteOutline, MdOutlineMoreVert } from 'react-icons/md'
import { RiPencilLine } from 'react-icons/ri'
import { taskType } from 'type/basicTypes'

export const Task = ({
	data,
	index,
	isDragDisabled = false,
}: {
	data: taskType
	index: number
	isDragDisabled?: boolean
}) => {
	const { colorMode } = useColorMode()
	const { currentUser } = useContext(AuthContext)

	return (
		<Draggable isDragDisabled={isDragDisabled} draggableId={`task-${data.id}`} index={index}>
			{(provided, snapShot) => {
				return (
					<VStack
						overflow={'hidden'}
						alignItems={'flex-start'}
						spacing={4}
						bg={colorMode == 'dark' ? '#1a202c' : 'white'}
						borderRadius={10}
						marginBottom={4}
						border={
							snapShot.isDragging
								? '2px solid'
								: colorMode == 'dark'
								? undefined
								: '2px solid'
						}
						borderColor={
							snapShot.isDragging
								? 'hu-Green.normal'
								: colorMode == 'dark'
								? undefined
								: 'gray.400'
						}
						padding={4}
						ref={provided.innerRef}
						{...provided.draggableProps}
						boxShadow={`10px 10px 10px 0px ${
							colorMode == 'light' ? '#1a202c29' : '#ffffff00'
						}`}
					>
						<HStack w={'full'} justifyContent={'space-between'} alignItems={'center'}>
							<Text
								fontSize={'xl'}
								{...provided.dragHandleProps}
								fontWeight={'medium'}
							>
								{data.name}
							</Text>
							<Menu>
								<MenuButton as={Button} paddingInline={3}>
									<MdOutlineMoreVert />
								</MenuButton>
								<MenuList>
									<MenuItem
										onClick={() => {
											data.onOpenDetail(data.id)
										}}
										icon={<IoEyeOutline fontSize={'15px'} />}
									>
										View
									</MenuItem>
									{(!isDragDisabled ||
										(currentUser?.role === 'Employee' &&
											data?.assignBy?.id === currentUser?.id)) && (
										<>
											<MenuItem
												onClick={() => {
													data.onOpenUpdate(data.id)
												}}
												icon={<RiPencilLine fontSize={'15px'} />}
											>
												Edit
											</MenuItem>

											<MenuItem
												onClick={() => {
													data.onOpenDelete(data.id)
												}}
												icon={<MdOutlineDeleteOutline fontSize={'15px'} />}
											>
												Delete
											</MenuItem>
										</>
									)}
								</MenuList>
							</Menu>
						</HStack>
						<Text
							fontSize={'sm'}
							color={colorMode == 'dark' ? 'white' : 'black'}
							opacity={0.5}
						>
							{`${new Date(data.deadline).getDate()}-${
								new Date(data.deadline).getMonth() + 1
							}-${new Date(data.deadline).getFullYear()}`}
						</Text>
						<Image borderRadius={10} src={`https://source.unsplash.com/random/280x120?architecture,${data.id}`}/>
						<Text
							width={'full'}
							color={colorMode == 'dark' ? 'white' : 'black'}
							opacity={0.5}
							isTruncated
						>
							<div
								dangerouslySetInnerHTML={{
									__html: data.description,
								}}
							/>
						</Text>
						<HStack w={'full'} justifyContent={'space-between'}>
							<HStack spacing={4}>
								<HStack h={'full'} alignItems={'center'} justifyContent={'center'}>
									<BiMessageDots
										color={colorMode == 'dark' ? 'white' : 'black'}
										opacity={0.5}
										fontSize={'18px'}
									/>
									<Text>3</Text>
								</HStack>
								<HStack h={'full'} alignItems={'center'} justifyContent={'center'}>
									<AiOutlineFile
										color={colorMode == 'dark' ? 'white' : 'black'}
										opacity={0.5}
										fontSize={'18px'}
									/>
									<Text>4</Text>
								</HStack>
							</HStack>
							<AvatarGroup size="sm" max={2}>
								{data.employees.map((employee) => (
									<Avatar
										key={employee.id}
										name={employee.name}
										src={employee.avatar?.url}
									/>
								))}
							</AvatarGroup>
						</HStack>
					</VStack>
				)
			}}
		</Draggable>
	)
}
