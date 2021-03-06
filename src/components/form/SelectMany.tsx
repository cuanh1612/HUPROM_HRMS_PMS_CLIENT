import {
	Button,
	FormControl,
	FormHelperText,
	FormLabel,
	HStack,
	useColorModeValue,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import Select from 'react-select'
import makeAnimated from 'react-select/animated'
import { IOption } from 'type/basicTypes'
import { ISelect } from 'type/element/commom'

const animatedComponents = makeAnimated()

export const SelectMany = ({
	name,
	label,
	form,
	required = false,
	options,
	selectedOptions,
	isModal,
	onOpenModal,
}: ISelect & { form: UseFormReturn<any, any> }) => {
	const errorColor = useColorModeValue('red.400', 'pink.400')

	const [selectedOptionsState, setSelectedOptionsState] = useState<IOption[]>([])

	//set state when have selected option prop
	useEffect(() => {
		if (selectedOptions) {
			setSelectedOptionsState(selectedOptions)
		}
	}, [selectedOptions])

	//handle change select
	const onChangeSelect = (options: IOption[]) => {
		let newOptionSelects: any[] = []

		for (let index = 0; index < options.length; index++) {
			const option = options[index]
			newOptionSelects.push(option.value)
		}

		//Set state
		setSelectedOptionsState(options)

		//Set value form select many
		form.setValue(name, newOptionSelects)
	}

	//Set again sate when have data selected options select
	useEffect(() => {
		if (selectedOptions) {
			setSelectedOptionsState(selectedOptions)
		}
	}, [selectedOptions])

	return (
		<>
			<FormControl isRequired={required}>
				{label && (
					<FormLabel color={'gray.400'} fontWeight={'normal'} htmlFor={name}>
						{label}
					</FormLabel>
				)}

				<HStack w={'full'} position={'relative'}>
					<Select
						options={options}
						value={selectedOptionsState}
						closeMenuOnSelect={false}
						components={animatedComponents}
						isMulti
						onChange={(value) => {
							onChangeSelect(value as IOption[])
						}}
					/>
					{isModal && onOpenModal && <Button onClick={onOpenModal}>Add</Button>}
				</HStack>

				{form?.formState?.errors[name] && (
					<FormHelperText color={errorColor}>
						{form.formState.errors[name].message}
					</FormHelperText>
				)}
			</FormControl>
		</>
	)
}
