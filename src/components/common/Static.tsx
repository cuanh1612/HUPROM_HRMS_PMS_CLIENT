import { GridItem, HStack, Text, useColorMode } from '@chakra-ui/react'
import React from 'react'

export const Static = ({
	color,
	title,
	text,
	icon,
}: {
	title: string
	color: string
	text?: string | number | any
	icon: any
}) => {
	const {colorMode} = useColorMode()
	return (
		<GridItem p={'20px'} borderBottom={'3px solid'} borderColor={`hu-${color}.normal`}>
			<HStack w="full" justifyContent={'space-between'} spacing={5}>
				<HStack spacing={5}>
					<HStack
						justifyContent={'center'}
						borderRadius={5}
						bg={`hu-${color}.${colorMode == 'dark' ? 'normal': 'lightA'}`}
						color={`hu-${color}.${colorMode == 'dark' ? 'white': 'normal'}`}
						w={'40px'}
						h={'40px'}
					>
						{icon}
					</HStack>
					<Text>{title}</Text>
				</HStack>
				<Text fontWeight={'semibold'} fontSize={'30px'}>
					{text || 0}
				</Text>
			</HStack>
		</GridItem>
	)
}
