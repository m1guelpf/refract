import Error from 'next/error'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'
import uploadToIPFS from '@/lib/ipfs'
import Input from '@/components/Input'
import { toastOn } from '@/lib/toasts'
import { useRouter } from 'next/router'
import urlRegexSafe from 'url-regex-safe'
import { useMemo, useState } from 'react'
import { format as timeago } from 'timeago.js'
import PostDisplay from '@/components/PostDisplay'
import LensHubProxy from '@/abis/LensHubProxy.json'
import MirrorButton from '@/components/MirrorButton'
import { useProfile } from '@/context/ProfileContext'
import { omit, trimIndentedSpaces } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client'
import BROADCAST_MUTATION from '@/graphql/broadcast/broadcast'
import { ERROR_MESSAGE, LENSHUB_PROXY, RELAYER_ON } from '@/lib/consts'
import CREATE_COMMENT_SIG from '@/graphql/publications/create-comment-typed-data'
import GET_POST_WITH_COMMENTS from '@/graphql/publications/get-post-with-comments'
import { useAccount, useContractWrite, useNetwork, useSignTypedData } from 'wagmi'
import {
	Maybe,
	CreateCommentBroadcastItemResult,
	PaginatedPublicationResult,
	Post,
	Publication,
	RelayResult,
	Comment,
} from '@/generated/types'

const PostPage = () => {
	const {
		query: { id },
	} = useRouter()

	const { profile } = useProfile()
	const { chain } = useNetwork()
	const { address } = useAccount()

	const [extraUpvotes, setExtraUpvotes] = useState<Record<string, number>>({})
	const [extraComment, setExtraComment] = useState<string>(null)
	const [comment, setComment] = useState<string>('')

	const { data, loading } = useQuery<{ post: Maybe<Publication>; comments: PaginatedPublicationResult }>(
		GET_POST_WITH_COMMENTS,
		{ variables: { publicationId: id, profileId: profile?.id } }
	)

	const post = useMemo(() => {
		if (!data?.post) return

		return {
			...data.post,
			stats: {
				...data.post.stats,
				totalAmountOfMirrors: data.post.stats.totalAmountOfMirrors + (extraUpvotes?.[data.post.id] ?? 0),
			},
			link: data.post.metadata.content.match(urlRegexSafe())?.pop(),
		} as Post & {
			link: string
		}
	}, [data?.post, extraUpvotes])

	const comments = useMemo(() => {
		if (!data?.comments) return
		let comments = [...data.comments.items]

		if (extraComment) {
			comments.push({
				id: 'fake-id',
				createdAt: new Date().toString(),
				profile,
				stats: {
					totalAmountOfMirrors: 0,
				},
				metadata: {
					content: extraComment,
				},
			} as unknown as Publication)
		}

		return comments.map(comment => ({
			...comment,
			stats: {
				...comment.stats,
				totalAmountOfMirrors: comment.stats.totalAmountOfMirrors + (extraUpvotes?.[comment.id] ?? 0),
			},
		}))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data?.comments, extraComment, extraUpvotes])

	const [getTypedData, { loading: dataLoading }] = useMutation<{
		createCommentTypedData: CreateCommentBroadcastItemResult
	}>(CREATE_COMMENT_SIG, {
		onError: error => toast.error(error.message ?? ERROR_MESSAGE),
	})
	const { signTypedDataAsync: signRequest, isLoading: sigLoading } = useSignTypedData({
		onError: error => {
			toast.error(error.message ?? ERROR_MESSAGE)
		},
	})
	const { writeAsync: sendTx, isLoading: txLoading } = useContractWrite({
		mode: 'recklesslyUnprepared',
		addressOrName: LENSHUB_PROXY,
		contractInterface: LensHubProxy,
		functionName: 'commentWithSig',
		onError(error: any) {
			toast.error(error?.data?.message ?? error?.message)
		},
		onSuccess() {
			setExtraComment(comment)
			setComment('')
		},
	})
	const [broadcast, { loading: gasslessLoading }] = useMutation<{ broadcast: RelayResult }>(BROADCAST_MUTATION, {
		onCompleted({ broadcast }) {
			if ('reason' in broadcast) return

			setExtraComment(comment)
			setComment('')
		},
		onError() {
			toast.error(ERROR_MESSAGE)
		},
	})

	const postComment = async event => {
		event.preventDefault()

		if (!address) return toast.error('Please connect your wallet first.')
		if (chain?.unsupported) return toast.error('Please change your network.')
		if (!profile) return toast.error('Please create a Lens profile first.')

		const content = trimIndentedSpaces(comment)

		const { id, typedData } = await toastOn(
			async () => {
				const ipfsCID = await uploadToIPFS({
					version: '1.0.0',
					metadata_id: uuidv4(),
					description: content,
					content: content,
					external_url: null,
					image: null,
					imageMimeType: null,
					name: `Comment by @${profile.handle}`,
					attributes: [
						{
							traitType: 'string',
							key: 'type',
							value: 'comment',
						},
					],
					media: [],
					appId: 'refract',
				})

				const {
					data: { createCommentTypedData },
				} = await getTypedData({
					variables: {
						request: {
							profileId: profile.id,
							publicationId: post.id,
							contentURI: `ipfs://${ipfsCID}`,
							collectModule: {
								freeCollectModule: {
									followerOnly: false,
								},
							},
						},
					},
				})

				return createCommentTypedData
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
			profileIdPointed,
			pubIdPointed,
			referenceModuleData,
			collectModule,
			collectModuleInitData,
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
						contentURI,
						profileIdPointed,
						pubIdPointed,
						referenceModuleData,
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

	if (!loading && !post) return <Error statusCode={404} />
	if (!loading && post.appId != 'refract') {
		return (
			<div className="my-4 space-y-2">
				<div className="flex flex-col items-center justify-center pt-12 space-y-4">
					<p className="text-white/60">Not a Refract post!</p>
					<a
						href={`https://open.withlens.app/post/${data.post.id}`}
						className="px-4 rounded-xl font-medium h-9 flex items-center bg-white text-black"
					>
						View on Lens
					</a>
				</div>
			</div>
		)
	}

	if (loading) {
		return (
			<div className="my-4 space-y-2">
				<div className="flex items-center justify-center pt-12">
					<p className="text-white/60">Loading...</p>
				</div>
			</div>
		)
	}

	return (
		<>
			<div className="my-4 space-y-6">
				<div>
					{post && (
						<PostDisplay
							post={post}
							onMirror={() => setExtraUpvotes(extras => ({ ...extras, [post.id]: 1 }))}
						/>
					)}
				</div>
				<form onSubmit={postComment} className="space-y-4">
					<Input
						label="Comment"
						as="textarea"
						value={comment}
						onChange={setComment}
						required
						placeholder="Great link! Here's a cool story about it..."
					/>
					<button
						disabled={sigLoading || txLoading}
						type="submit"
						className={`px-4 rounded-xl font-medium h-9 bg-white text-black disabled:cursor-wait`}
					>
						Create
					</button>
				</form>
				<div className="!mt-8 space-y-4">
					{comments.map((comment: Comment) => (
						<div key={comment.id} className="flex items-start space-x-3">
							<MirrorButton
								minimal
								post={comment}
								userMirrors={comment.mirrors}
								onChange={() => setExtraUpvotes(extras => ({ ...extras, [comment.id]: 1 }))}
							/>
							<div className="space-y-2">
								<p>{comment.metadata.content}</p>
								<p className="text-white/60 text-sm">
									<span>
										{comment.stats.totalAmountOfMirrors}{' '}
										{comment.stats.totalAmountOfMirrors == 1 ? 'point' : 'points'} by{' '}
									</span>
									<a
										href={`https://open.withlens.app/profile/${comment.profile.handle}`}
										target="_blank"
										className="hover:underline"
										rel="noreferrer"
									>
										{comment.profile.handle}
									</a>
									<span className="mx-1.5">·</span>
									<span>{timeago(comment.createdAt)}</span>
								</p>
							</div>
						</div>
					))}
					{comments.length == 0 && (
						<div className="flex items-center justify-center pt-12">
							<p className="text-white/60">No comments yet!</p>
						</div>
					)}
				</div>
			</div>
		</>
	)
}

export default PostPage
