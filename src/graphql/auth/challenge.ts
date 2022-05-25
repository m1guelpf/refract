import { gql } from '@apollo/client'

const CHALLENGE_QUERY = gql`
	query ($address: EthereumAddress!) {
		challenge(request: { address: $address }) {
			text
		}
	}
`

export default CHALLENGE_QUERY
