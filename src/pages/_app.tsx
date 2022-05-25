import 'tailwindcss/tailwind.css'
import { APP_NAME, IS_MAINNET } from '@/lib/consts'
import '@rainbow-me/rainbowkit/styles.css'
import { chain, createClient, WagmiConfig } from 'wagmi'
import { apiProvider, configureChains, getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import client from '@/lib/apollo'
import { ApolloProvider } from '@apollo/client'
import Layout from '@/components/Layout'
import ProfileContext from '@/context/ProfileContext'
import { useState } from 'react'

const { chains, provider } = configureChains(
	[IS_MAINNET ? chain.polygon : chain.polygonMumbai],
	[apiProvider.infura(process.env.NEXT_PUBLIC_INFURA_ID), apiProvider.fallback()]
)

const { connectors } = getDefaultWallets({ appName: APP_NAME, chains })
const wagmiClient = createClient({ autoConnect: true, connectors, provider })

const App = ({ Component, pageProps }) => {
	const [profile, setProfile] = useState<{ id: string; handle: string; isDefault: boolean }>(null)

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
