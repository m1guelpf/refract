import { gql } from '@apollo/client'

const REFRESH_QUERY = gql`
	mutation ($refreshToken: Jwt!) {
		refresh(request: { refreshToken: $refreshToken }) {
			accessToken
			refreshToken
		}
	}
`

export default REFRESH_QUERY
