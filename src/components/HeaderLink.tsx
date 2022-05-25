import Link from 'next/link'
import { useRouter } from 'next/router'

const HeaderLink = ({ href, children }) => {
	const { pathname } = useRouter()
	return (
		<Link href={href}>
			<button
				className={`px-4 rounded-xl font-medium h-9 ${pathname == href ? 'bg-white/20' : 'hover:bg-white/10'}`}
			>
				{children}
			</button>
		</Link>
	)
}

export default HeaderLink
