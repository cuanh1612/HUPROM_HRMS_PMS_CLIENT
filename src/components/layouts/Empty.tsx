import { Box } from '@chakra-ui/react'
import { ReactElement } from 'react'

export const EmptyLayout = ({ children }: { children: ReactElement }) => (
	<Box minHeight={"100vh"}>
		{children}
	</Box>
)
