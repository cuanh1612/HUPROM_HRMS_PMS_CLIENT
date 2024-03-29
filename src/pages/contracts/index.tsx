import {
	Avatar,
	Box,
	Button,
	HStack,
	Text,
	useColorMode,
	useDisclosure,
	VStack,
} from '@chakra-ui/react'
import { AlertDialog, Func, FuncCollapse, Head, Table } from 'components/common'
import { Drawer } from 'components/Drawer'
import { DateRange, Input, Select, SelectCustom } from 'components/filter'
import ImportCSV from 'components/importCSV'
import { ClientLayout } from 'components/layouts'
import { AuthContext } from 'contexts/AuthContext'
import {
	deleteContractMutation,
	deleteContractsMutation,
	importCSVContractsMutation,
	publicLinkContractMutation,
} from 'mutations'

import { useRouter } from 'next/router'
import {
	allClientsQuery,
	allContractsByClientQuery,
	allContractsQuery,
	allContractTypesQuery,
} from 'queries'
import { useContext, useEffect, useState } from 'react'
import { CSVLink } from 'react-csv'
import { AiOutlineDelete, AiOutlineSearch } from 'react-icons/ai'
import { BiExport } from 'react-icons/bi'
import { FaFileCsv } from 'react-icons/fa'
import { IoAdd } from 'react-icons/io5'
import { VscFilter } from 'react-icons/vsc'
import { IOption } from 'type/basicTypes'
import { NextLayout } from 'type/element/layout'
import { IFilter, TColumn } from 'type/tableTypes'
import { contractColumn } from 'utils/columns'
import AddContract from './add-contracts'
import UpdateContract from './update-contracts'

const Contracts: NextLayout = () => {
	const { isAuthenticated, handleLoading, setToast, currentUser } = useContext(AuthContext)
	const router = useRouter()
	const { colorMode } = useColorMode()

	//State ---------------------------------------------------------------------
	// is reset table
	const [contractIdUpdate, setContractIdUpdate] = useState<number | null>(6)

	//state csv
	const [dataCSV, setDataCSV] = useState<any[]>([])

	// set loading table
	const [isLoading, setIsLoading] = useState(true)

	// data select to delete all
	const [dataSl, setDataSl] = useState<Array<number> | null>()

	// get id to delete employee
	const [idDlContract, setIdDlContract] = useState<number>()

	// set filter
	const [filter, setFilter] = useState<IFilter>({
		columnId: '',
		filterValue: '',
	})

	// get client to select to filter
	const [clientsFilter, setClientsFilter] = useState<IOption[]>([])

	// is reset table
	const [isResetFilter, setIsReset] = useState(false)

	// query and mutation -=------------------------------------------------------
	// get all contracts
	const { data: allContracts, mutate: refetchAllContracts } = allContractsQuery(isAuthenticated)
	const { data: allContractsByClient } = allContractsByClientQuery(
		isAuthenticated,
		String(currentUser?.id)
	)

	const { data: allContractTypes } = allContractTypesQuery()

	const { data: allClients } = allClientsQuery(isAuthenticated)

	//Setup download csv --------------------------------------------------------
	const headersCSV = [
		{ label: 'id', key: 'id' },
		{ label: 'alternate_address', key: 'alternate_address' },
		{ label: 'cell', key: 'cell' },
		{ label: 'city', key: 'city' },
		{ label: 'client', key: 'client' },
		{ label: 'company_logo', key: 'company_logo' },
		{ label: 'contract_type', key: 'contract_type' },
		{ label: 'contract_value', key: 'contract_value' },
		{ label: 'country', key: 'country' },
		{ label: 'currency', key: 'currency' },
		{ label: 'description', key: 'description' },
		{ label: 'notes', key: 'notes' },
		{ label: 'office_phone_number', key: 'office_phone_number' },
		{ label: 'postal_code', key: 'postal_code' },
		{ label: 'sign', key: 'sign' },
		{ label: 'state', key: 'state' },
		{ label: 'subject', key: 'subject' },
		{ label: 'end_date', key: 'end_date' },
		{ label: 'start_date', key: 'start_date' },
		{ label: 'createdAt', key: 'createdAt' },
		{ label: 'updatedAt', key: 'updatedAt' },
	]

	//Setup download csv --------------------------------------------------------
	const headersCSVTemplate = [
		{ label: 'alternate_address', key: 'alternate_address' },
		{ label: 'cell', key: 'cell' },
		{ label: 'city', key: 'city' },
		{ label: 'client', key: 'client' },
		{ label: 'contract_type', key: 'contract_type' },
		{ label: 'contract_value', key: 'contract_value' },
		{ label: 'country', key: 'country' },
		{ label: 'currency', key: 'currency' },
		{ label: 'notes', key: 'notes' },
		{ label: 'office_phone_number', key: 'office_phone_number' },
		{ label: 'postal_code', key: 'postal_code' },
		{ label: 'state', key: 'state' },
		{ label: 'subject', key: 'subject' },
		{ label: 'end_date', key: 'end_date' },
		{ label: 'start_date', key: 'start_date' },
	]

	const dataCSVTemplate = [
		{
			subject: 'Subject example',
			alternate_address: '196/31 Cong Hoa',
			cell: '84888888888',
			city: 'HCM',
			client: 1,
			contract_type: 1,
			contract_value: 100,
			country: 'VN',
			currency: 'USD',
			notes: 'Note',
			office_phone_number: '84888888888',
			postal_code: '1000',
			state: 'Tan Binh',
			end_date: '6/13/2022',
			start_date: '7/13/2022',
		},
		{
			subject: 'Subject example',
			alternate_address: '196/31 Cong Hoa',
			cell: '84888888888',
			city: 'HCM',
			client: 1,
			contract_type: 1,
			contract_value: 100,
			country: 'VN',
			currency: 'GBP',
			notes: 'Note',
			office_phone_number: '84888888888',
			postal_code: '1000',
			state: 'Tan Binh',
			end_date: '6/13/2022',
			start_date: '7/13/2022',
		},
		{
			subject: 'Subject example',
			alternate_address: '196/31 Cong Hoa',
			cell: '84888888888',
			city: 'HCM',
			client: 1,
			contract_type: 1,
			contract_value: 100,
			country: 'VN',
			currency: 'EUR',
			notes: 'Note',
			office_phone_number: '84888888888',
			postal_code: '1000',
			state: 'Tan Binh',
			end_date: '6/13/2022',
			start_date: '7/13/2022',
		},
		{
			subject: 'Subject example',
			alternate_address: '196/31 Cong Hoa',
			cell: '84888888888',
			city: 'HCM',
			client: 1,
			contract_type: 1,
			contract_value: 100,
			country: 'VN',
			currency: 'INR',
			notes: 'Note',
			office_phone_number: '84888888888',
			postal_code: '1000',
			state: 'Tan Binh',
			end_date: '6/13/2022',
			start_date: '7/13/2022',
		},
		{
			subject: 'Subject example',
			alternate_address: '196/31 Cong Hoa',
			cell: '84888888888',
			city: 'HCM',
			client: 1,
			contract_type: 1,
			contract_value: 100,
			country: 'INR',
			currency: 'VND',
			notes: 'Note',
			office_phone_number: '84888888888',
			postal_code: '1000',
			state: 'Tan Binh',
			end_date: '6/13/2022',
			start_date: '7/13/2022',
		},
	]

	// mutation -------------------------------------------------------------------
	// delete holidays
	const [mutateDeleteContracts, { status: statusDlContracts, data: dataDlMany }] =
		deleteContractsMutation(setToast)

	// delete holiday
	const [mutateDeleteContract, { status: statusDl, data: dataDl }] =
		deleteContractMutation(setToast)

	// get public link
	const [mutateGetPublic, { data: contractToken, status: statusToken }] =
		publicLinkContractMutation(setToast)

	const [mutateImportCSV, { status: statusImportCSV, data: dataImportCSV }] =
		importCSVContractsMutation(setToast)

	//Setup drawer --------------------------------------------------------------
	const { isOpen: isOpenAdd, onOpen: onOpenAdd, onClose: onCloseAdd } = useDisclosure()
	const { isOpen: isOpenUpdate, onOpen: onOpenUpdate, onClose: onCloseUpdate } = useDisclosure()
	// set isOpen of dialog to delete one
	const { isOpen: isOpenDialogDl, onOpen: onOpenDl, onClose: onCloseDl } = useDisclosure()
	const {
		isOpen: isOpenImportCSV,
		onOpen: onOpenImportCSV,
		onClose: onCloseImportCSV,
	} = useDisclosure()

	// set isOpen of dialog to delete one
	const {
		isOpen: isOpenDialogDlMany,
		onOpen: onOpenDlMany,
		onClose: onCloseDlMany,
	} = useDisclosure()

	// set isOpen of drawer to filters
	const { isOpen: isOpenFilter, onOpen: onOpenFilter, onClose: onCloseFilter } = useDisclosure()

	//User effect ---------------------------------------------------------------

	// set client to filter
	useEffect(() => {
		if (allClients?.clients) {
			const valuesFilter = allClients.clients.map(
				(client): IOption => ({
					label: (
						<>
							<HStack>
								<Avatar size={'xs'} name={client.name} src={client.avatar?.url} />
								<Text color={colorMode == 'dark' ? 'white' : 'black'}>
									{client.name}
								</Text>
							</HStack>
						</>
					),
					value: String(client.id),
				})
			)
			setClientsFilter(valuesFilter)
		}
	}, [allClients, colorMode])

	//Handle check logged in
	useEffect(() => {
		if (isAuthenticated) {
			handleLoading(false)
		} else {
			if (isAuthenticated === false) {
				router.push('/login')
			}
		}
	}, [isAuthenticated])

	// check is successfully import csv
	useEffect(() => {
		if (statusImportCSV == 'success' && dataImportCSV?.message) {
			setToast({
				msg: dataImportCSV?.message,
				type: statusImportCSV,
			})
			setDataSl(null)
			refetchAllContracts()
		}
	}, [statusImportCSV])

	useEffect(() => {
		if (allContracts) {
			setIsLoading(false)

			if (allContracts.contracts) {
				//Set data csv
				const dataCSV: any[] = allContracts.contracts.map((contract) => ({
					id: contract.id,
					alternate_address: contract.alternate_address,
					cell: contract.cell,
					city: contract.city,
					client: contract.client,
					company_logo: contract.company_logo?.id,
					contract_type: contract.contract_type?.id,
					contract_value: contract.contract_value,
					country: contract.country,
					currency: contract.currency,
					description: contract.description,
					notes: contract.notes,
					office_phone_number: contract.office_phone_number,
					postal_code: contract.postal_code,
					sign: contract.sign,
					state: contract.state,
					subject: contract.subject,
					end_date: contract.end_date,
					start_date: contract.start_date,
					createdAt: contract.createdAt,
					updatedAt: contract.updatedAt,
				}))

				setDataCSV(dataCSV)
			}
		}
	}, [allContracts])

	// check is successfully delete many
	useEffect(() => {
		if (statusDlContracts == 'success' && dataDlMany) {
			setToast({
				msg: dataDlMany.message,
				type: statusDlContracts,
			})
			setDataSl(null)
			refetchAllContracts()
		}
	}, [statusDlContracts])

	// check is successfully delete one
	useEffect(() => {
		if (statusDl == 'success' && dataDl) {
			setToast({
				msg: dataDl.message,
				type: statusDl,
			})
			refetchAllContracts()
		}
	}, [statusDl])

	useEffect(() => {
		if (statusToken == 'success' && contractToken) {
			router.push(`/contracts/public/${contractToken.token}`)
		}
	}, [statusToken])

	// function --------------------------------------
	const handleImportCSV = (data: any) => {
		mutateImportCSV({
			contracts: data,
		})

		onCloseImportCSV()
	}

	// header ----------------------------------------
	const columns: TColumn[] = contractColumn({
		colorMode,
		currentUser,
		onUpdate: (id: number) => {
			setContractIdUpdate(id)
			onOpenUpdate()
		},
		onDelete: (id: number) => {
			setIdDlContract(id)
			onOpenDl()
		},
		onPublic: (id: number) => {
			mutateGetPublic(id)
		},
	})

	return (
		<Box pb={8}>
			<Head title="Contracts" />
			<Box className="function">
				<FuncCollapse>
					{currentUser && currentUser.role === 'Admin' && (
						<>
							<Func
								icon={<IoAdd />}
								description={'Add new contract by form'}
								title={'Add new'}
								action={onOpenAdd}
							/>

							<CSVLink filename={'contracts.csv'} headers={headersCSV} data={dataCSV}>
								<Func
									icon={<BiExport />}
									description={'export to csv'}
									title={'export'}
									action={() => {}}
								/>
							</CSVLink>

							<CSVLink
								filename={'contractsTemplate.csv'}
								headers={headersCSVTemplate}
								data={dataCSVTemplate}
							>
								<Func
									icon={<FaFileCsv />}
									description={'export csv template'}
									title={'export csv template'}
									action={() => {}}
								/>
							</CSVLink>

							<ImportCSV
								fieldsValid={[
									'alternate_address',
									'cell',
									'city',
									'client',
									'contract_type',
									'contract_value',
									'country',
									'currency',
									'notes',
									'office_phone_number',
									'postal_code',
									'state',
									'subject',
									'end_date',
									'start_date',
								]}
								handleImportCSV={handleImportCSV}
								statusImport={statusImportCSV === 'running'}
								isOpenImportCSV={isOpenImportCSV}
								onCloseImportCSV={onCloseImportCSV}
								onOpenImportCSV={onOpenImportCSV}
							/>
							<Func
								icon={<AiOutlineDelete />}
								title={'Delete all'}
								description={'Delete all contracts you selected'}
								action={onOpenDlMany}
								disabled={!dataSl || dataSl.length == 0 ? true : false}
							/>
						</>
					)}
					<Func
						icon={<VscFilter />}
						description={'Open draw to filter'}
						title={'filter'}
						action={onOpenFilter}
					/>
				</FuncCollapse>
			</Box>
			{currentUser && (
				<Table
					data={
						(currentUser?.role == 'Admin'
							? allContracts?.contracts
							: allContractsByClient?.contracts) || []
					}
					columns={columns}
					isLoading={isLoading}
					isSelect={currentUser?.role == 'Admin' ? true : false}
					selectByColumn="id"
					setSelect={(data: Array<number>) => setDataSl(data)}
					filter={filter}
					isResetFilter={isResetFilter}
					disableColumns={['contract_type']}
				/>
			)}

			<Drawer size="xl" title="Add Contract" onClose={onCloseAdd} isOpen={isOpenAdd}>
				<AddContract onCloseDrawer={onCloseAdd} />
			</Drawer>
			<Drawer size="xl" title="Update Contract" onClose={onCloseUpdate} isOpen={isOpenUpdate}>
				<UpdateContract onCloseDrawer={onCloseUpdate} contractIdUpdate={contractIdUpdate} />
			</Drawer>
			{/* alert dialog when delete many */}
			<AlertDialog
				handleDelete={() => {
					if (dataSl) {
						setIsLoading(true)
						mutateDeleteContracts(dataSl)
					}
				}}
				title="Are you sure to delete all?"
				content="You will not be able to recover the deleted record!"
				isOpen={isOpenDialogDlMany}
				onClose={onCloseDlMany}
			/>

			{/* alert dialog when delete one */}
			<AlertDialog
				handleDelete={() => {
					setIsLoading(true)
					mutateDeleteContract(String(idDlContract))
				}}
				title="Are you sure?"
				content="You will not be able to recover the deleted record!"
				isOpen={isOpenDialogDl}
				onClose={onCloseDl}
			/>

			{/* filter */}
			<Drawer
				isOpen={isOpenFilter}
				onClose={onCloseFilter}
				title="Filter"
				size="xs"
				footer={
					<Button
						onClick={() => {
							setIsReset(true)
							setTimeout(() => {
								setIsReset(false)
							}, 1000)
						}}
					>
						filter
					</Button>
				}
			>
				<VStack p={6} spacing={5}>
					<Input
						handleSearch={(data: IFilter) => {
							setFilter(data)
						}}
						columnId={'subject'}
						label="Subject"
						placeholder="Enter subject"
						icon={<AiOutlineSearch fontSize={'20px'} color="gray" opacity={0.6} />}
						type={'text'}
					/>
					{allContractTypes && (
						<Select
							options={allContractTypes.contractTypes?.map((type) => ({
								label: type.name,
								value: type.id,
							}))}
							handleSearch={(data: IFilter) => {
								setFilter(data)
							}}
							columnId={'contract_type'}
							label="Contract type"
							placeholder="Select type"
						/>
					)}
					<DateRange
						handleSelect={(date: { from: Date; to: Date }) => {
							setFilter({
								columnId: 'start_date',
								filterValue: date,
							})
						}}
						label="Select date"
					/>
					{clientsFilter && (
						<SelectCustom
							placeholder="Select client"
							handleSearch={(field: any) => {
								setFilter({
									columnId: 'client',
									filterValue: field.value,
								})
							}}
							label={'Client'}
							name={'client'}
							options={[
								{
									label: (
										<Text color={colorMode == 'light' ? 'black' : 'white'}>
											all
										</Text>
									),
									value: '',
								},

								...clientsFilter,
							]}
							required={false}
						/>
					)}
				</VStack>
			</Drawer>
		</Box>
	)
}

Contracts.getLayout = ClientLayout

export default Contracts
