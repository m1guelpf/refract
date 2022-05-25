import { gql } from '@apollo/client'

const DOES_FOLLOW = gql`
	query ($followerAddress: EthereumAddress!, $profileId: ProfileId!) {
		doesFollow(request: { followInfos: [{ followerAddress: $address, profileId: $profileId }] }) {
			follows
		}
	}
`

export default DOES_FOLLOW
