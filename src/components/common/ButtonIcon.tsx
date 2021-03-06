import { IconButton } from '@chakra-ui/react'
import React from 'react'
import { IButtonIcon } from 'type/element/commom'

export const ButtonIcon = ({
	isDisabled = false,
	handle,
	ariaLabel,
	icon,
	bg,
	activeColor,
	hoverColor,
	color,
	activeBg,
	hoverBg,
	radius = false,
	htmlFor,
}: IButtonIcon)=> {
	return (
		<IconButton
			cursor={'pointer'}
			as={'label'}
			htmlFor={htmlFor}
			borderRadius={radius ? 'full' : undefined}
			color={color}
			disabled={isDisabled}
			bg={bg}
			_hover={{
				background: hoverBg,
				color: hoverColor,
			}}
			_active={{
				background: activeBg,
				color: activeColor,
			}}
			onClick={handle}
			aria-label={ariaLabel}
			icon={icon}
		/>
	)
}
