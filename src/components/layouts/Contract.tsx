import { Box, HStack } from '@chakra-ui/react'
import { TabsMenu } from 'components/common'
import Navigation from 'components/navigation/Index'
import { Header } from 'components/partials'
import { AuthContext } from 'contexts/AuthContext'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import { AiOutlineFileAdd, AiOutlineFileImage, AiOutlineFileText, AiOutlineProject } from 'react-icons/ai'
import { BsPerson } from 'react-icons/bs'
import { GrDocumentText } from 'react-icons/gr'
import { RiDiscussLine } from 'react-icons/ri'
import { VscCommentDiscussion } from 'react-icons/vsc'
import { ITab } from 'type/element/commom'
{
	/* <Tab>Summary</Tab>
					<Tab>Discussion</Tab>
					<Tab isSelected={true}>Contract Files</Tab> */
}
export const ContractLayout = ({ children }: { children: JSX.Element }) => {
	const { currentUser } = useContext(AuthContext)
	const {
		query: { contractId },
	} = useRouter()
	const [tabs, setTabs] = useState<ITab[]>([])
	useEffect(() => {
		if (contractId) {
			const data = [
				{
					icon: <AiOutlineFileText fontSize={'15'} />,
					link: `/contracts/${contractId}/detail`,
					title: 'Detail',
				},
				{
					icon: <VscCommentDiscussion fontSize={'15'} />,
					link: `/contracts/${contractId}/discussions`,
					title: 'Discussions',
				},
				{
					icon: <AiOutlineFileAdd fontSize={'15'} />,
					link: `/contracts/${contractId}/files`,
					title: 'Files',
				},
			]
			setTabs(data)
		}
	}, [contractId, currentUser])
	return (
		<HStack
			minHeight={'100vh'}
			height={'100px'}
			alignItems={'start'}
			pos={'relative'}
			spacing={'0px'}
			w={'100%'}
			overflow={'auto'}
		>
			<Navigation />
			<Box w={'full'}>
				<Header />
				<Box w={'full'} h={'auto'} paddingInline={10}>
					<TabsMenu tabs={tabs} />
					{children}
				</Box>
			</Box>
		</HStack>
	)
}
