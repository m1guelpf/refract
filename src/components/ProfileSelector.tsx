import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useQuery } from '@apollo/client'
import { useProfile } from '@/context/ProfileContext'
import GET_PROFILES from '@/graphql/auth/get-profiles'
import { PaginatedProfileResult } from '@/generated/types'

const ProfileSelector = () => {
	const { data: account } = useAccount()
	const { profile, setProfile } = useProfile()
	const { data: profiles } = useQuery<{ profiles: PaginatedProfileResult }>(GET_PROFILES, {
		skip: !account.address,
		variables: { address: account?.address },
	})

	useEffect(() => {
		if (!profiles?.profiles?.items) return

		setProfile(profiles.profiles.items.find(profile => profile.isDefault) ?? profiles.profiles.items[0])
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [profiles])

	if (!profile) return null

	return <p className="font-medium text-sm">@{profile.handle}</p>
}

export default ProfileSelector
