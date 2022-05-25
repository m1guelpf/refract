import Link from 'next/link'
import HeaderLink from './HeaderLink'
import ConnectWallet from './ConnectWallet'
import { useLazyQuery, useQuery } from '@apollo/client'
import useLogin from '@/hooks/useLogin'
import { useAccount } from 'wagmi'
import GET_PROFILES from '@/graphql/auth/get-profiles'
import { useEffect, useState } from 'react'
import { PaginatedProfileResult, Profile } from '@/generated/types'
import { useProfile } from '@/context/ProfileContext'

const Header = () => {
	const { profile, setProfile } = useProfile()
	const { data: account } = useAccount()
	const { data: profiles } = useQuery<{ profiles: PaginatedProfileResult }>(GET_PROFILES, {
		skip: !account?.address,
		variables: { address: account?.address },
	})

	useEffect(() => {
		if (account?.address) return

		setProfile(null)
	}, [account])

	useEffect(() => {
		if (!profiles?.profiles?.items) return

		setProfile(profiles.profiles.items.find(profile => profile.isDefault) ?? profiles.profiles.items[0])
	}, [profiles])

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
			<div className="flex items-center space-x-4">
				{profile && <p className="font-medium text-sm">@{profile.handle}</p>}
				<ConnectWallet />
			</div>
		</header>
	)
}

export default Header
