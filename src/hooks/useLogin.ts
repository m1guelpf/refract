import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import { toastOn } from '@/lib/toasts'
import { useEffect, useState } from 'react'
import { COOKIE_CONFIG } from '@/lib/apollo'
import { useProfile } from '@/context/ProfileContext'
import CHALLENGE_QUERY from '@/graphql/auth/challenge'
import { useLazyQuery, useMutation } from '@apollo/client'
import AUTHENTICATE_QUERY from '@/graphql/auth/authenticate'
import { useAccount, useDisconnect, useSignMessage } from 'wagmi'

const useLogin = (): {
	login: () => Promise<{ accessToken: string; refreshToken: string }>
	logout: () => Promise<void>
	isAuthenticated: boolean
	loading: boolean
	error?: Error
} => {
	const { setProfile } = useProfile()
	const { disconnect } = useDisconnect()
	const [isAuthenticated, setAuthenticated] = useState<boolean>(false)
	const { data: accountData, isLoading: accountLoading, error: errorAccount } = useAccount()
	const [loadChallenge, { error: errorChallenge, loading: challengeLoading }] = useLazyQuery(CHALLENGE_QUERY, {
		fetchPolicy: 'no-cache',
	})
	const [authenticate, { error: errorAuthenticate, loading: authLoading }] = useMutation(AUTHENTICATE_QUERY)
	const { signMessageAsync: signMessage, isLoading: signLoading, error: errorSign } = useSignMessage()

	const login = async (): Promise<{ accessToken: string; refreshToken: string }> => {
		if (Cookies.get('accessToken') && Cookies.get('refreshToken')) {
			toast.success('Signed in!')
			return { accessToken: Cookies.get('accessToken'), refreshToken: Cookies.get('refreshToken') }
		}

		const {
			data: {
				challenge: { text: challenge },
			},
		} = await loadChallenge({ variables: { address: accountData?.address } })

		const signature = await signMessage({ message: challenge })

		const tokens = toastOn<{ accessToken: string; refreshToken: string }>(
			async () => {
				const {
					data: { authenticate: tokens },
				} = await authenticate({ variables: { address: accountData?.address, signature } })

				Cookies.set('accessToken', tokens.accessToken, COOKIE_CONFIG)
				Cookies.set('refreshToken', tokens.refreshToken, COOKIE_CONFIG)
				setAuthenticated(true)

				return tokens
			},
			{ loading: 'Authenticating...', success: 'Signed in!', error: 'Something went wrong! Please try again.' }
		)

		return tokens
	}

	const logout = async () => {
		Cookies.remove('accessToken', COOKIE_CONFIG)
		Cookies.remove('refreshToken', COOKIE_CONFIG)
		setAuthenticated(false)
		toast.success('Logged out!')
		setProfile(null)

		return disconnect()
	}

	useEffect(() => {
		if (!Cookies.get('accessToken') || (!Cookies.get('refreshToken') && accountData?.address)) return

		setAuthenticated(true)
	}, [])

	return {
		login,
		logout,
		isAuthenticated,
		loading: accountLoading || challengeLoading || signLoading || authLoading,
		error: errorAccount || errorChallenge || errorSign || errorAuthenticate,
	}
}

export default useLogin
