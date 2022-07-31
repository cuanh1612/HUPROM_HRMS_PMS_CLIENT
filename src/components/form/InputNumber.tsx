import {
	FormControl,
	FormHelperText,
	FormLabel,
	NumberDecrementStepper,
	NumberIncrementStepper,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	Text,
	useColorMode,
	useColorModeValue,
} from '@chakra-ui/react'
import { Controller, UseFormReturn } from 'react-hook-form'
import { IInputNumber } from 'type/element/commom'

export const InputNumber = ({
	name,
	label,
	form,
	required = false,
	min,
}: IInputNumber & { form: UseFormReturn<any, any> }) => {
	const { colorMode } = useColorMode()
	const errorColor = useColorModeValue('red.400', 'pink.400')

	const {
		control,
		formState: { errors },
	} = form

	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => (
				<FormControl>
					{label && (
						<FormLabel color={'gray.400'} fontWeight={'normal'} htmlFor={name}>
							{label}{' '}
							{required && (
								<Text as="span" color={colorMode == 'dark' ? 'red.400' : 'red'}>
									*
								</Text>
							)}
						</FormLabel>
					)}
					<NumberInput
						bg={colorMode == 'dark' ? '#3a4453' : undefined}
						precision={2}
						id={name}
						{...field}
						min={min}
					>
						<NumberInputField />
						<NumberInputStepper>
							<NumberIncrementStepper />
							<NumberDecrementStepper />
						</NumberInputStepper>
					</NumberInput>

					{errors[name] && (
						<FormHelperText color={errorColor}>{errors[name].message}</FormHelperText>
					)}
				</FormControl>
			)}
		/>
	)
}
