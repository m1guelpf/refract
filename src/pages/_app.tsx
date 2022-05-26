import 'tailwindcss/tailwind.css'
import client from '@/lib/apollo'
import * as Fathom from 'fathom-client'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import '@rainbow-me/rainbowkit/styles.css'
import { useEffect, useState } from 'react'
import { ApolloProvider } from '@apollo/client'
import { APP_NAME, IS_MAINNET } from '@/lib/consts'
import ProfileContext from '@/context/ProfileContext'
import { chain, createClient, WagmiConfig } from 'wagmi'
import { apiProvider, configureChains, getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'

const { chains, provider } = configureChains(
	[IS_MAINNET ? chain.polygon : chain.polygonMumbai],
	[apiProvider.infura(process.env.NEXT_PUBLIC_INFURA_ID), apiProvider.fallback()]
)

const { connectors } = getDefaultWallets({ appName: APP_NAME, chains })
const wagmiClient = createClient({ autoConnect: true, connectors, provider })

const App = ({ Component, pageProps }) => {
	const router = useRouter()
	const [profile, setProfile] = useState<{ id: string; handle: string; isDefault: boolean }>(null)

	useEffect(() => {
		Fathom.load('JIZTJTZK', {
			includedDomains: ['refract.withlens.app'],
			url: 'https://kangaroo-endorsed.withlens.app/script.js',
		})

		const onRouteChangeComplete = () => Fathom.trackPageview()

		router.events.on('routeChangeComplete', onRouteChangeComplete)

		return () => {
			router.events.off('routeChangeComplete', onRouteChangeComplete)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<WagmiConfig client={wagmiClient}>
			<RainbowKitProvider chains={chains}>
				<ApolloProvider client={client}>
					<ProfileContext.Provider value={{ profile, setProfile }}>
						<Layout>
							<Component {...pageProps} />
						</Layout>
					</ProfileContext.Provider>
				</ApolloProvider>
			</RainbowKitProvider>
		</WagmiConfig>
	)
}

export default App
