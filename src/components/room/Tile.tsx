import { memo, useEffect, useRef, useState } from 'react'
import { useMediaTrack, useParticipant } from '@daily-co/daily-react-hooks'
import { Avatar, Box, Center, useBreakpoint } from '@chakra-ui/react'
import { BiMicrophone, BiMicrophoneOff } from 'react-icons/bi'

const Tile = ({
	id,
	isCurrentUser = false,
	isCenter = false,
	screenShare = false,
	isTalking = false
}: {
	id: string
	isCurrentUser?: boolean
	isCenter?: boolean
	screenShare?: boolean
	isTalking?: boolean
})=> {
	const layoutSize = useBreakpoint()
	const [muted, setMuted] = useState(false)
	const videoTrack = useMediaTrack(id, screenShare ? 'screenVideo' : 'video')
	const audioTrack = useMediaTrack(id, screenShare ? 'screenVideo' : 'audio')

	const videoElement = useRef<any>(null)
	const audioElement = useRef<any>(null)

	const participant = useParticipant(id)

	useEffect(() => {
		/*  The track is ready to be played. We can show video of the remote participant in the UI.*/
		if (videoTrack?.state === 'playable') {
			videoElement.current &&
				(videoElement.current.srcObject =
					videoTrack && new MediaStream([videoTrack.persistentTrack] as any))
		}
	}, [videoTrack])

	useEffect(() => {
		if (audioTrack?.state === 'playable') {
			audioElement?.current &&
				(audioElement.current.srcObject =
					audioTrack && new MediaStream([audioTrack.persistentTrack] as any))
		}
	}, [audioTrack])

	if (isCenter) {
		return (
			<video
				autoPlay
				muted
				playsInline
				style={{
					width: '100%',
					height: '100%',
				}}
				ref={videoElement}
			/>
		)
	}

	return (
		<Box as="div" paddingBlock={['10px', null, '0px', '10px']}  paddingInline={['10px', null, null, '0px']} height={['120px', null,'170px']}>
			<Box
				w={'full'}
				h={'100%'}
				bg={videoTrack ? '#000000' : '#222222'}
				borderRadius={'15px'}
				pos={'relative'}
				overflow={'hidden'}
				border={isTalking ? '2px solid': ''} borderColor={isTalking ? 'hu-Green.normal': ''}
			>
				{!videoTrack.isOff ? (
					<video
						autoPlay
						muted
						playsInline
						style={{
							width: '100%',
							height: '100%',
						}}
						ref={videoElement}
					/>
				): (
					<Center h={'100%'}>
						<Avatar size={layoutSize?.includes('xl')? 'lg': 'md'} name={participant?.user_name} src={''}/>
					</Center>
				)}
				{!isCurrentUser && audioTrack && !screenShare && (
					<audio muted={muted} autoPlay playsInline ref={audioElement} />
				)}
				<Box
					pos={'absolute'}
					color={'white'}
					paddingInline={4}
					borderRadius={5}
					bg={isCurrentUser ? 'hu-Green.dark' : '#27292b70'}
					backdropBlur="10px"
					bottom={'15px'}
					right={'15px'}
				>
					{isCurrentUser ? 'You' : participant?.user_name}
				</Box>
				{!isCurrentUser && (
					<Box
						onClick={()=> {
							setMuted(!muted)
						}}
						cursor={'pointer'}
						pos={'absolute'}
						color={'white'}
						padding={2}
						borderRadius={5}
						bg={!muted ? '#27292b' : 'red.500'}
						backdropBlur="10px"
						top={'15px'}
						right={'15px'}
					>
						{muted ? <BiMicrophoneOff /> : <BiMicrophone />}
					</Box>
				)}
			</Box>
		</Box>
	)
}

export default memo(Tile)