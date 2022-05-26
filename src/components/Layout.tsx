import Header from './Header'
import { Toaster } from 'react-hot-toast'
import Head from 'next/head'
import Image from 'next/image'
import bgImage from '@images/bg.png'
import cardImage from '@images/card.jpg'

const Layout = ({ children }) => {
	const meta = {
		title: `Refract: Top Links in Crypto`,
		description: `Your crypto-friendly link board. Discover new projects, highlight interesting articles, and share new ideas. Curated by the community.`,
		image: `https://refract.withlens.app${cardImage.src}`,
	}

	return (
		<>
			<Head>
				<title>{meta.title}</title>
				<meta name="title" content={meta.title} />
				<meta name="description" content={meta.description} />

				<meta property="og:type" content="website" />
				<meta property="og:url" content="https://refract.withlens.app" />
				<meta property="og:title" content={meta.title} />
				<meta property="og:description" content={meta.description} />
				<meta property="og:image" content={meta.image} />

				<meta property="twitter:card" content="summary_large_image" />
				<meta property="twitter:url" content="https://refract.withlens.app" />
				<meta property="twitter:title" content={meta.title} />
				<meta property="twitter:description" content={meta.description} />
				<meta property="twitter:image" content={meta.image} />
			</Head>
			<div className="text-white min-h-screen">
				<div className="fixed inset-0 -z-10 h-screen">
					<Image src={bgImage} placeholder="blur" layout="fill" alt="" />
				</div>
				<Header />
				<main className="max-w-2xl mx-auto space-y-8 px-6 md:px-0">{children}</main>
				<Toaster position="bottom-right" />
			</div>
		</>
	)
}

export default Layout
