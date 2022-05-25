import { gql } from '@apollo/client'

const GET_PROFILES = gql`
	query ($address: EthereumAddress!) {
		profiles(request: { ownedBy: [$address], limit: 5 }) {
			items {
				id
				handle
				isDefault
			}
		}
	}
`

export default GET_PROFILES
