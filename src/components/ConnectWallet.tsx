import Cookies from 'js-cookie'
import { useAccount } from 'wagmi'
import { FC, useEffect } from 'react'
import useLogin from '@/hooks/useLogin'
import ProfileSelector from './ProfileSelector'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const ConnectWallet: FC = () => {
	const { data: account } = useAccount()
	const { login, logout, isAuthenticated } = useLogin()

	useEffect(() => {
		if (!account?.address) return
		if (Cookies.get('accessToken') && Cookies.get('refreshToken')) return

		login()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [account?.address])

	return (
		<ConnectButton.Custom>
			{({ account, chain, openChainModal, openConnectModal, mounted }) => {
				return (
					<div className={mounted ? '' : 'invisible pointer-events-none select-none'}>
						{(() => {
							if (!mounted || !account || !chain || !isAuthenticated) {
								return (
									<button
										onClick={openConnectModal}
										className="px-4 rounded-xl font-medium h-9 bg-white text-black"
									>
										Sign in
									</button>
								)
							}

							if (chain.unsupported) {
								return (
									<button
										onClick={openChainModal}
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
						})()}
					</div>
				)
			}}
		</ConnectButton.Custom>
	)
}

export default ConnectWallet
