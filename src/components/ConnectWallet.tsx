import Cookies from 'js-cookie'
import { chain, useAccount, useNetwork, useSwitchNetwork } from 'wagmi'
import { FC, useEffect } from 'react'
import useLogin from '@/hooks/useLogin'
import ProfileSelector from './ProfileSelector'
import { ConnectKitButton } from 'connectkit'
import { IS_MAINNET } from '@/lib/consts'

const ConnectWallet: FC = () => {
	const { isConnected } = useAccount()
	const { switchNetwork } = useSwitchNetwork({ chainId: (IS_MAINNET ? chain.polygon : chain.polygonMumbai).id })
	const { login, logout, isAuthenticated } = useLogin()

	useEffect(() => {
		if (!isConnected) return
		if (Cookies.get('accessToken') && Cookies.get('refreshToken')) return

		login()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isConnected])

	return (
		<ConnectKitButton.Custom>
			{({ unsupported, show, isConnected }) => {
				if (!isConnected || !isAuthenticated) {
					return (
						<button onClick={show} className="px-4 rounded-xl font-medium h-9 bg-white text-black">
							Sign in
						</button>
					)
				}

				if (unsupported) {
					return (
						<button
							onClick={() => switchNetwork()}
							className="px-4 rounded-xl font-medium h-9 bg-white text-black"
						>
							Switch network
						</button>
					)
				}

				return (
					<div className="flex items-center space-x-4">
						<ProfileSelector />
						<button
							onClick={logout}
							type="button"
							className="px-4 rounded-xl font-medium h-9 bg-white text-black"
						>
							Sign Out
						</button>
					</div>
				)
			}}
		</ConnectKitButton.Custom>
	)
}

export default ConnectWallet
