import { useContext, createContext, Dispatch, SetStateAction } from 'react'

type Profile = { id: string; handle: string; isDefault: boolean }

const ProfileContext = createContext<{ profile: Profile; setProfile: Dispatch<SetStateAction<Profile>> }>(null)
ProfileContext.displayName = 'ProfileContext'

export const useProfile = (): { profile: Profile; setProfile: Dispatch<SetStateAction<Profile>> } => {
	return useContext(ProfileContext)
}

export default ProfileContext
