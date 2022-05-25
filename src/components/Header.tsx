import Link from 'next/link'
import HeaderLink from './HeaderLink'
import ConnectWallet from './ConnectWallet'

const Header = () => {
	return (
		<header className="flex items-center justify-between px-6 h-16">
			<Link href="/">
				<a className="font-bold">Refract</a>
			</Link>
			<div className="flex items-center space-x-4">
				<HeaderLink href="/">Trending</HeaderLink>
				<HeaderLink href="/newest">Newest</HeaderLink>
				<HeaderLink href="/create">Create</HeaderLink>
			</div>
			<ConnectWallet />
		</header>
	)
}

export default Header
