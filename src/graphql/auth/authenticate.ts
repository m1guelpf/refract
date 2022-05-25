import { gql } from '@apollo/client'

const AUTHENTICATE_QUERY = gql`
	mutation ($address: EthereumAddress!, $signature: Signature!) {
		authenticate(request: { address: $address, signature: $signature }) {
			accessToken
			refreshToken
		}
	}
`

export default AUTHENTICATE_QUERY
