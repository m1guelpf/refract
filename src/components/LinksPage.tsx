import Link from 'next/link'
import { FC, useMemo } from 'react'
import HeaderLink from './HeaderLink'
import urlRegexSafe from 'url-regex-safe'
import { useQuery } from '@apollo/client'
import { format as timeago } from 'timeago.js'
import { ChevronUpIcon } from '@heroicons/react/solid'
import { ExplorePublicationResult } from '@/generated/types'
import EXPLORE_PUBLICATIONS from '@/graphql/explore/explorePublications'

type SortCriteria = 'TOP_COLLECTED' | 'TOP_COMMENTED' | 'LATEST'

const LinksPage: FC<{ sortCriteria?: SortCriteria }> = ({ sortCriteria = 'TOP_COLLECTED' }) => {
	const { data, loading, error } = useQuery<{ explorePublications: ExplorePublicationResult }>(EXPLORE_PUBLICATIONS, {
		variables: { sortCriteria },
	})

	const links = useMemo(() => {
		if (!data) return

		console.log(data)

		return data.explorePublications.items
			.map(post => {
				const link = post.metadata.content.match(urlRegexSafe())?.pop()
				return {
					...post,
					link: !link ? null : link.startsWith('http') ? link : `https://${link}`,
				}
			})
			.filter(post => post.link)
	}, [data])

	console.log(links)

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
							<button className="bg-white/30 p-1 flex items-center justify-center rounded-full group">
								<ChevronUpIcon className="w-5 h-5 transform transition group-hover:-translate-y-0.5" />
							</button>
							<div className="space-y-2">
								<a href="http://example.com" className="space-x-1 group">
									<p className="font-semibold group-visited:text-white/60 inline">
										{post.metadata.name}
									</p>
									<span className="text-white/70 group-visited:text-white/40">
										({new URL(post.link).host})
									</span>
								</a>
								<p className="text-white/60 text-sm">
									<span>{post.stats.totalAmountOfMirrors} points by </span>
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
