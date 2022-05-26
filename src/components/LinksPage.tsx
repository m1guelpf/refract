import Link from 'next/link'
import HeaderLink from './HeaderLink'
import urlRegexSafe from 'url-regex-safe'
import MirrorButton from './MirrorButton'
import { useQuery } from '@apollo/client'
import { FC, useMemo, useState } from 'react'
import { format as timeago } from 'timeago.js'
import { useProfile } from '@/context/ProfileContext'
import { HasMirroredResult, Post } from '@/generated/types'
import HAS_MIRRORED from '@/graphql/publications/has-mirrored'
import EXPLORE_PUBLICATIONS from '@/graphql/explore/explorePublications'

type SortCriteria = 'TOP_COLLECTED' | 'TOP_COMMENTED' | 'LATEST'

const LinksPage: FC<{ sortCriteria?: SortCriteria }> = ({ sortCriteria = 'TOP_COLLECTED' }) => {
	const { profile } = useProfile()
	const [extraUpvotes, setExtraUpvotes] = useState<Record<string, number>>({})

	const { data, loading, error } = useQuery<{ explorePublications: { items: Post[] } }>(EXPLORE_PUBLICATIONS, {
		variables: { sortCriteria },
	})
	const links = useMemo(() => {
		if (!data) return

		return data.explorePublications.items
			.map(post => {
				const link = post.metadata.content.match(urlRegexSafe())?.pop()
				return {
					...post,
					stats: {
						...post.stats,
						totalAmountOfMirrors: post.stats.totalAmountOfMirrors + (extraUpvotes?.[post.id] ?? 0),
					},
					link: !link ? null : link.startsWith('http') ? link : `https://${link}`,
				}
			})
			.filter(post => post.link)
			.sort((a, b) => {
				if (sortCriteria == 'LATEST') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				if (sortCriteria == 'TOP_COLLECTED') return b.stats.totalAmountOfMirrors - a.stats.totalAmountOfMirrors
			})
	}, [data, extraUpvotes, sortCriteria])

	const { data: hasMirrored } = useQuery<{ hasMirrored: HasMirroredResult[] }>(HAS_MIRRORED, {
		variables: { profileId: profile?.id, publicationIds: links?.map(link => link.id) },
		skip: !profile?.id || !links,
	})

	return (
		<>
			<h2 className="my-4 text-2xl font-medium">{sortCriteria == 'LATEST' ? 'Newest' : 'Trending'}</h2>
			<div className="flex md:hidden items-center space-x-4">
				<HeaderLink href="/">Trending</HeaderLink>
				<HeaderLink href="/newest">Newest</HeaderLink>
				<HeaderLink href="/create">Create</HeaderLink>
			</div>
			{!loading && !error && links?.length == 0 && (
				<div className="flex items-center justify-center pt-12">
					<p className="text-white/60">
						No links yet!{' '}
						<Link href="/create">
							<a className="underline">Wanna be the first?</a>
						</Link>
					</p>
				</div>
			)}
			{loading && (
				<div className="flex items-center justify-center pt-12">
					<p className="text-white/60">Loading...</p>
				</div>
			)}
			<ul id="posts" className="space-y-12">
				{links &&
					links.map(post => (
						<li key={post.id} className="flex items-start space-x-3">
							<MirrorButton
								post={post}
								mirroredPosts={hasMirrored?.hasMirrored?.[0]}
								onChange={() => setExtraUpvotes(extras => ({ ...extras, [post.id]: 1 }))}
							/>
							<div className="space-y-2">
								<a href={post.link} className="space-x-1 group">
									<p className="font-semibold text-white group-visited:text-[#999999] inline">
										{post.metadata.name}
									</p>
									<span className="text-white/70 group-visited:text-[#777777]">
										({new URL(post.link).host})
									</span>
								</a>
								<p className="text-white/60 text-sm">
									<span>
										{post.stats.totalAmountOfMirrors}{' '}
										{post.stats.totalAmountOfMirrors == 1 ? 'point' : 'points'} by{' '}
									</span>
									<a
										href={`https://lenster.xyz/u/${post.profile.handle}`}
										target="_blank"
										className="hover:underline"
										rel="noreferrer"
									>
										{post.profile.handle}
									</a>
									<span className="mx-1.5">·</span>
									<Link href={`/posts/${post.id}`}>
										<a className="hover:underline">{timeago(post.createdAt)}</a>
									</Link>
									<span className="mx-1.5">·</span>
									<Link href={`/posts/${post.id}`}>
										<a className="hover:underline">{post.stats.totalAmountOfComments} comments</a>
									</Link>
								</p>
							</div>
						</li>
					))}
			</ul>
		</>
	)
}

export default LinksPage
