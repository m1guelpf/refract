import { gql } from '@apollo/client'

const HAS_MIRRORED = gql`
	query ($profileId: ProfileId!, $publicationIds: [InternalPublicationId!]!) {
		hasMirrored(request: { profilesRequest: [{ profileId: $profileId, publicationIds: $publicationIds }] }) {
			profileId
			results {
				mirrored
				publicationId
			}
		}
	}
`

export default HAS_MIRRORED
