import { ethers } from 'ethers'
import { omit } from '@/lib/utils'
import toast from 'react-hot-toast'
import { toastOn } from '@/lib/toasts'
import { useMutation } from '@apollo/client'
import { FC, useEffect, useState } from 'react'
import LensHubProxy from '@/abis/LensHubProxy.json'
import { useProfile } from '@/context/ProfileContext'
import { ChevronUpIcon } from '@heroicons/react/solid'
import { ERROR_MESSAGE, LENSHUB_PROXY } from '@/lib/consts'
import CREATE_MIRROR_SIG from '@/graphql/publications/create-mirror-typed-data'
import { useAccount, useContractWrite, useNetwork, useSignTypedData } from 'wagmi'
import { CreateMirrorBroadcastItemResult, HasMirroredResult, Publication } from '@/generated/types'

const MirrorButton: FC<{
	post: Publication
	mirroredPosts: HasMirroredResult
	onChange: Function
	minimal?: boolean
}> = ({ post, onChange, mirroredPosts, minimal = false }) => {
	const { profile } = useProfile()
	const { activeChain } = useNetwork()
	const { data: account } = useAccount()
	const [isMirroring, setMirroring] = useState<boolean>(false)

	useEffect(() => {
		setMirroring(
			mirroredPosts?.results?.find(mirroredPost => mirroredPost.publicationId === post?.id)?.mirrored ?? false
		)
	}, [post?.id, mirroredPosts?.results])

	const [getTypedData] = useMutation<{
		createMirrorTypedData: CreateMirrorBroadcastItemResult
	}>(CREATE_MIRROR_SIG, {
		onError: error => toast.error(error.message ?? ERROR_MESSAGE),
	})
	const { signTypedDataAsync: signRequest, isLoading: sigLoading } = useSignTypedData({
		onError: error => {
			toast.error(error.message ?? ERROR_MESSAGE)
		},
	})

	const { writeAsync: sendTx } = useContractWrite(
		{
			addressOrName: LENSHUB_PROXY,
			contractInterface: LensHubProxy,
		},
		'mirrorWithSig',
		{
			onError(error: any) {
				toast.error(error?.data?.message ?? error?.message)
			},
			onSuccess() {
				setMirroring(true)
				onChange()
			},
		}
	)

	const mirrorPost = async () => {
		if (!account?.address) return toast.error('Please connect your wallet first.')
		if (activeChain?.unsupported) return toast.error('Please change your network.')
		if (!profile) return toast.error('Please create a Lens profile first.')

		const { typedData } = await toastOn(
			async () => {
				const {
					data: { createMirrorTypedData },
				} = await getTypedData({
					variables: {
						profileId: profile.id,
						publicationId: post.id,
					},
				})

				return createMirrorTypedData
			},
			{
				loading: 'Getting signature details...',
				success: 'Signature is ready!',
				error: 'Something went wrong! Please try again later',
			}
		)

		const {
			profileId,
			profileIdPointed,
			pubIdPointed,
			referenceModuleData,
			referenceModule,
			referenceModuleInitData,
			deadline,
		} = typedData.value

		const { v, r, s } = ethers.utils.splitSignature(
			await signRequest({
				domain: omit(typedData?.domain, '__typename'),
				types: omit(typedData?.types, '__typename'),
				value: omit(typedData?.value, '__typename'),
			})
		)

		await toastOn(
			() =>
				sendTx({
					args: {
						profileId,
						profileIdPointed,
						pubIdPointed,
						referenceModuleData,
						referenceModule,
						referenceModuleInitData,
						sig: { v, r, s, deadline },
					},
				}),
			{ loading: 'Sending transaction...', success: 'Transaction sent!', error: ERROR_MESSAGE }
		)
	}

	return (
		<button
			onClick={mirrorPost}
			disabled={isMirroring}
			className={`${
				isMirroring
					? `${minimal ? 'text-white' : 'bg-white text-black'} cursor-default`
					: `${minimal ? 'text-white/60' : 'bg-white/30'} group`
			} ${minimal ? 'py-1 -mt-0.5' : 'p-1'} flex items-center justify-center rounded-full`}
		>
			<ChevronUpIcon className="w-5 h-5 transform transition group-hover:-translate-y-0.5" />
		</button>
	)
}

export default MirrorButton
