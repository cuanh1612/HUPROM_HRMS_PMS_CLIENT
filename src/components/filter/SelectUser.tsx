import { Listbox } from '@headlessui/react'
import { Avatar, Box, FormControl, FormLabel, HStack, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { IPeople } from 'type/element/commom'
import { BiChevronDown } from 'react-icons/bi'

const SelectUser = ({
	peoples,
	required,
	label,
	handleSearch,
	columnId,
}: {
	peoples: IPeople[]
	required: boolean
	label: string
	[index: string]: any
}) => {
	const [users] = useState<IPeople[]>([
		{
			id: '',
			name: 'Select user',
			avatar: '',
		},
		...peoples,
	])
	const [selectedPerson, setSelectedPerson] = useState(users[0])

	return (
		<FormControl isRequired={required}>
			<FormLabel color={'gray.400'} fontWeight={'normal'}>
				{label}
			</FormLabel>
			<Box>
				<Listbox
					value={selectedPerson}
					onChange={(value) => {
						setSelectedPerson(value)
						handleSearch({
							columnId,
							filterValue: value.id,
						})
					}}
				>
					<Listbox.Button className={'listBt'}>
						<HStack
							background={'#ffffff10'}
							w={'full'}
							borderWidth={1}
							borderColor={'gray.600'}
							h={'40px'}
							borderRadius={'8px'}
							padding={'0px 10px 1px 16px'}
							justifyContent={'space-between'}
						>
							<HStack width={'85%'} spacing={4}>
								{selectedPerson.id && (
									<Avatar
										name={selectedPerson.name}
										src={selectedPerson.avatar}
										size={'xs'}
									/>
								)}
								<Text isTruncated>{selectedPerson.name}</Text>
							</HStack>

							<BiChevronDown fontSize={'20px'} color="white" />
						</HStack>
					</Listbox.Button>
					<Listbox.Options className={'listOps'}>
						<VStack
							listStyleType={'none'}
							alignItems={'start'}
							borderWidth={1}
							borderRadius={15}
							paddingBlock={4}
						>
							{users.map((person) => (
								<Listbox.Option
									className={({ active }) =>
										!active ? 'listOp' : 'listOpActive'
									}
									key={person.id}
									value={person}
								>
									<HStack
										w={'full'}
										spacing={4}
										h={'40px'}
										borderRadius={'5px'}
										padding={'0px 32px 1px 16px'}
										cursor={'pointer'}
									>
										{person.id && (
											<Avatar
												name={person.name}
												src={person.avatar}
												size={'xs'}
											/>
										)}
										<Text>{person.name}</Text>
									</HStack>
								</Listbox.Option>
							))}
						</VStack>
					</Listbox.Options>
				</Listbox>
			</Box>
		</FormControl>
	)
}

export default SelectUser
