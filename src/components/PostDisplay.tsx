import { FC } from 'react'
import Link from 'next/link'
import MirrorButton from './MirrorButton'
import { format as timeago } from 'timeago.js'
import { HasMirroredResult, Post } from '@/generated/types'

const PostDisplay: FC<{
	post: Post & { link: string }
	hasMirrored: HasMirroredResult
	onMirror: Function
	className?: string
	as?: string | FC
}> = ({ post, hasMirrored, onMirror, className = '', as: Component = 'div' }) => {
	return (
		/* @ts-ignore */
		<Component key={post.id} className={`flex items-start space-x-3 ${className}`}>
			<MirrorButton post={post} onChange={onMirror} mirroredPosts={hasMirrored} />
			<div className="space-y-2">
				<a href={post.link} className="space-x-1 group">
					<p className="font-semibold text-white group-visited:text-[#999999] inline">{post.metadata.name}</p>
					<span className="text-white/70 group-visited:text-[#888888]">({new URL(post.link).host})</span>
				</a>
				<p className="text-white/60 text-sm">
					<span>
						{post.stats.totalAmountOfMirrors} {post.stats.totalAmountOfMirrors == 1 ? 'point' : 'points'} by{' '}
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
						<a className="hover:underline">
							{post.stats.totalAmountOfComments}{' '}
							{post.stats.totalAmountOfComments == 1 ? 'comment' : 'comments'}
						</a>
					</Link>
				</p>
			</div>
		</Component>
	)
}

export default PostDisplay
