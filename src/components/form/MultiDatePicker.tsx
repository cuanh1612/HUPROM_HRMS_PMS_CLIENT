import {
	FormControl,
	FormLabel,
	InputGroup,
	InputLeftElement,
	Input as CInput,
	FormHelperText,
	useColorModeValue,
	Box,
} from '@chakra-ui/react'
import { Controller, UseFormReturn } from 'react-hook-form'
import { IInput } from 'type/element/commom'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { useState } from 'react'

export const MultiDatePicker = ({
	name,
	label,
	icon,
	form,
	placeholder,
	required = false,
	type = 'text',
}: IInput & { form: UseFormReturn<any, any> }) => {
	const errorColor = useColorModeValue('red.400', 'pink.400')

	const {
		control,
		formState: { errors },
	} = form

	//Set up for multiple date picker -------------------------------------------
	const [days, setDays] = useState<{ date: Date[]; dateString: string[] }>({
		date: [],
		dateString: [],
	})

	const footer =
		days && days.date?.length > 0
			? `You selected ${days?.date.length} day(s).`
			: `Please pick one or more days.`

	return (
		<Controller
			control={control}
			name={name}
			render={() => (
				<FormControl role={'group'} isRequired={required}>
					<FormLabel fontWeight={'normal'} htmlFor={name}>
						{label}
					</FormLabel>
					<InputGroup>
						<InputLeftElement pointerEvents="none" children={icon} />
						<CInput
							autoComplete="off"
							background={'#ffffff10'}
							placeholder={placeholder}
							id={name}
							type={type}
							value={days.dateString.toString()}
						/>
					</InputGroup>

					{/* date picker */}
					<Box
						border={'1px'}
						borderColor={'gray.200'}
						borderRadius={5}
						display={'none'}
						_groupHover={{ display: 'block' }}
						pos={'absolute'}
						top={'72px'}
						right={'0px'}
						bg={'white'}
						zIndex={10}
					>
						<DayPicker
							mode="multiple"
							min={1}
							selected={days?.date}
							onSelect={(days) => {
								//Set state date select
								const newDaysConvert = days?.map((day) => day.toLocaleDateString())
								setDays({
									date: days ? days : [],
									dateString: newDaysConvert ? newDaysConvert : [],
								})

								//Set data form
								form.setValue(name, days)
							}}
							footer={footer}
						/>
					</Box>

					{errors[name] && (
						<FormHelperText color={errorColor}>{errors[name].message}</FormHelperText>
					)}
				</FormControl>
			)}
		/>
	)
}
