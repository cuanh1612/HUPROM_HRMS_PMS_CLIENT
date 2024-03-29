import { Box, Button, Collapse, HStack, Text, useDisclosure, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/router'

import React, { useEffect, useMemo, useState } from 'react'
import { BiChevronRight } from 'react-icons/bi'
import { employeeType } from 'type/basicTypes'
import { ILinkItem } from 'type/element/commom'
import LinkItem from './LinkItem'

interface ILinkGroup {
	title: string
	icon: any
	data: ILinkItem[]
	currentUser: employeeType | null
}

export default function LinkGroup({ title, icon, data, currentUser }: ILinkGroup) {
	const { isOpen, onToggle, onOpen } = useDisclosure()
	const { pathname } = useRouter()
	const [currentData, setCurrentData] = useState<ILinkItem[]>([])
	const [links, setLinks] = useState<string[]>([])
	const [paths, setPaths] = useState<string[]>([])
	
	const notViewPages = useMemo(() => {
		return [
			'Employees',
			'Skills',
			'Jobs',
			'Job applications',
			'Offer letters',
			'Interview schedule',
			'Dashboard',
			'Contracts',
		]
	}, [])

	useEffect(() => {
		if (currentData) {
			const result = currentData.map((item) => item.link)
			setLinks(result)
		}
	}, [currentData])

	useEffect(() => {
		if (currentUser?.role == 'Employee' || currentUser?.role == 'Client') {
			const newData = data.filter((e) => {
				if (currentUser?.role == 'Client' && e.title == 'Contracts') return true
				return !notViewPages.includes(e.title)
			})

			setCurrentData(newData)
		} else {
			setCurrentData(data)
		}
	}, [currentUser])

	useEffect(() => {
		if (pathname) {
			const result = pathname.split('/').map((item) => `/${item}`)
			setPaths(result)
		}
	}, [pathname])

	useEffect(() => {
		if (paths && links) {
			paths.map((path) => {
				if (links.includes(path)) {
					onOpen()
				}
			})
		}
	}, [paths, links])

	return (
		<Box w={'full'}>
			<Button
				color={isOpen ? 'hu-Green.normal' : 'gray.400'}
				justifyContent={'start'}
				leftIcon={icon}
				borderRight={'5px solid'}
				borderColor={'transparent'}
				borderRadius={'5px 0px 0px 5px'}
				w={'full'}
				_focus={{
					outline: 'none',
				}}
				_hover={{
					borderRight: '5px solid',
					borderColor: 'hu-Green.lightA',
					color: 'hu-Green.normal',
				}}
				variant={'ghost'}
				onClick={onToggle}
			>
				<HStack marginLeft={2} w={'full'} justifyContent={'space-between'}>
					<Text>{title}</Text>
					<BiChevronRight
						style={{
							transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
							transition: '0.2s',
						}}
						fontSize={'22px'}
					/>
				</HStack>
			</Button>
			<Collapse in={isOpen} animateOpacity>
				<Box paddingLeft={'24px'}>
					<VStack
						mt="4"
						spacing={2}
						paddingLeft={2}
						borderLeft={'1px solid'}
						borderColor={'gray.300'}
					>
						{currentData.map((item, key) => {
							return (
								<LinkItem
									key={key}
									title={item.title}
									icon={item.icon}
									link={item.link}
								/>
							)
						})}
					</VStack>
				</Box>
			</Collapse>
		</Box>
	)
}
