import { ethers } from 'ethers'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'
import uploadToIPFS from '@/lib/ipfs'
import Input from '@/components/Input'
import { toastOn } from '@/lib/toasts'
import { useMemo, useState } from 'react'
import { useMutation } from '@apollo/client'
import HeaderLink from '@/components/HeaderLink'
import LensHubProxy from '@/abis/LensHubProxy.json'
import { useProfile } from '@/context/ProfileContext'
import { omit, trimIndentedSpaces } from '@/lib/utils'
import { ERROR_MESSAGE, LENSHUB_PROXY } from '@/lib/consts'
import { CreatePostBroadcastItemResult } from '@/generated/types'
import CREATE_POST_SIG from '@/graphql/publications/create-post-typed-data'
import { useAccount, useContractWrite, useNetwork, useSignTypedData } from 'wagmi'

const Create = () => {
	const { profile } = useProfile()
	const { data: account } = useAccount()
	const { activeChain } = useNetwork()

	const [getTypedData, { loading: dataLoading }] = useMutation<{
		createPostTypedData: CreatePostBroadcastItemResult
	}>(CREATE_POST_SIG, {
		onError: error => toast.error(error.message ?? ERROR_MESSAGE),
	})
	const { signTypedDataAsync: signRequest, isLoading: sigLoading } = useSignTypedData({
		onError: error => {
			toast.error(error.message ?? ERROR_MESSAGE)
		},
	})
	const {
		data,
		writeAsync: sendTx,
		isLoading: txLoading,
	} = useContractWrite(
		{
			addressOrName: LENSHUB_PROXY,
			contractInterface: LensHubProxy,
		},
		'postWithSig',
		{
			onError(error: any) {
				toast.error(error?.data?.message ?? error?.message)
			},
			onSuccess() {
				setTitle('')
				setLink('')
				setDescription('')
			},
		}
	)

	const [title, setTitle] = useState<string>('')
	const [link, setLink] = useState<string>('')
	const [description, setDescription] = useState<string>('')

	const createPost = async event => {
		event.preventDefault()
		if (!account?.address) return toast.error('Please connect your wallet first.')
		if (activeChain?.unsupported) return toast.error('Please change your network.')
		if (!profile) return toast.error('Please create a Lens profile first.')

		const content = trimIndentedSpaces(description)

		const { typedData } = await toastOn(
			async () => {
				const ipfsCID = await uploadToIPFS({
					version: '1.0.0',
					metadata_id: uuidv4(),
					description: content ? `${content}\n\n${link}` : link,
					content: content ? `${content}\n\n${link}` : link,
					external_url: null,
					image: null,
					imageMimeType: null,
					name: title,
					attributes: [
						{
							traitType: 'string',
							key: 'type',
							value: 'post',
						},
					],
					media: [],
					appId: 'refract',
				})

				const {
					data: { createPostTypedData },
				} = await getTypedData({
					variables: {
						request: {
							profileId: profile.id,
							contentURI: `ipfs://${ipfsCID}`,
							collectModule: {
								freeCollectModule: {
									followerOnly: false,
								},
							},
						},
					},
				})

				return createPostTypedData
			},
			{
				loading: 'Getting signature details...',
				success: 'Signature is ready!',
				error: 'Something went wrong! Please try again later',
			}
		)

		const {
			profileId,
			contentURI,
			collectModule,
			collectModuleInitData,
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
						contentURI,
						collectModule,
						collectModuleInitData,
						referenceModule,
						referenceModuleInitData,
						sig: { v, r, s, deadline },
					},
				}),
			{ loading: 'Sending transaction...', success: 'Transaction sent!', error: ERROR_MESSAGE }
		)
	}

	const isLoading = useMemo(() => dataLoading || sigLoading || txLoading, [dataLoading, sigLoading, txLoading])

	return (
		<>
			<div className="my-4 space-y-2">
				<h2 className="text-2xl font-medium">Create</h2>
				<p className="text-white/40">Share your favourite links from all around the internet!</p>
			</div>
			<div className="flex md:hidden items-center space-x-4">
				<HeaderLink href="/">Trending</HeaderLink>
				<HeaderLink href="/newest">Newest</HeaderLink>
				<HeaderLink href="/create">Create</HeaderLink>
			</div>
			<form onSubmit={createPost} className="pt-12 space-y-6">
				<Input
					label="Title"
					placeholder="Introducing Refract: A HN-style forum, built on Lens."
					required
					value={title}
					onChange={setTitle}
				/>
				<Input
					label="Link"
					placeholder="https://refract.withlens.app/"
					type="url"
					required
					value={link}
					onChange={setLink}
				/>
				<Input
					as="textarea"
					label="Description"
					placeholder="Hey Lensters! Just launched Refract, a Hacker News style forum, build on top of Lens. Come check it out!"
					value={description}
					onChange={setDescription}
					description={
						<span>
							Won&apos;t be shown on Refract, but will make your posts prettier in other Lens sites.{' '}
							<span className="font-medium">Your link gets automatically appended at the end.</span>
						</span>
					}
				/>
				<button
					disabled={isLoading}
					type="submit"
					className={`px-4 rounded-xl font-medium h-9 bg-white text-black disabled:cursor-wait`}
				>
					Create
				</button>
			</form>
		</>
	)
}

export default Create
