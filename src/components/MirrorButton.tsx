import { ethers } from 'ethers'
import { omit } from '@/lib/utils'
import toast from 'react-hot-toast'
import { toastOn } from '@/lib/toasts'
import { useMutation } from '@apollo/client'
import { FC, useEffect, useState } from 'react'
import LensHubProxy from '@/abis/LensHubProxy.json'
import { useProfile } from '@/context/ProfileContext'
import { ChevronUpIcon } from '@heroicons/react/solid'
import BROADCAST_MUTATION from '@/graphql/broadcast/broadcast'
import { ERROR_MESSAGE, LENSHUB_PROXY, RELAYER_ON } from '@/lib/consts'
import CREATE_MIRROR_SIG from '@/graphql/publications/create-mirror-typed-data'
import { useAccount, useContractWrite, useNetwork, useSignTypedData } from 'wagmi'
import { CreateMirrorBroadcastItemResult, Publication, RelayResult } from '@/generated/types'

const MirrorButton: FC<{
	post: Publication
	onChange: Function
	minimal?: boolean
	userMirrors: string[]
}> = ({ post, onChange, userMirrors, minimal = false }) => {
	const { profile } = useProfile()
	const { chain } = useNetwork()
	const { address } = useAccount()
	const [isMirroring, setMirroring] = useState<boolean>(userMirrors.length > 0)

	useEffect(() => {
		setMirroring(userMirrors.length > 0)
	}, [userMirrors?.length])

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

	const { writeAsync: sendTx } = useContractWrite({
		mode: 'recklesslyUnprepared',
		addressOrName: LENSHUB_PROXY,
		contractInterface: LensHubProxy,
		functionName: 'mirrorWithSig',
		onError(error: any) {
			toast.error(error?.data?.message ?? error?.message)
		},
		onSuccess() {
			setMirroring(true)
			onChange()
		},
	})
	const [broadcast] = useMutation<{ broadcast: RelayResult }>(BROADCAST_MUTATION, {
		onCompleted({ broadcast }) {
			if ('reason' in broadcast) return

			setMirroring(true)
			onChange()
		},
		onError() {
			toast.error(ERROR_MESSAGE)
		},
	})

	const mirrorPost = async () => {
		if (!address) return toast.error('Please connect your wallet first.')
		if (chain?.unsupported) return toast.error('Please change your network.')
		if (!profile) return toast.error('Please create a Lens profile first.')

		const { id, typedData } = await toastOn(
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

		const signature = await signRequest({
			domain: omit(typedData?.domain, '__typename'),
			types: omit(typedData?.types, '__typename'),
			value: omit(typedData?.value, '__typename'),
		})

		const { v, r, s } = ethers.utils.splitSignature(signature)

		if (RELAYER_ON) {
			return toastOn(
				async () => {
					const {
						data: { broadcast: result },
					} = await broadcast({
						variables: {
							request: { id, signature },
						},
					})

					if ('reason' in result) throw result.reason
				},
				{ loading: 'Sending transaction...', success: 'Transaction sent!', error: ERROR_MESSAGE }
			)
		}

		await toastOn(
			() =>
				sendTx({
					recklesslySetUnpreparedArgs: {
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
