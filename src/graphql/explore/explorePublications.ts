import { gql } from '@apollo/client'

const EXPLORE_PUBLICATIONS = gql`
	query ($sortCriteria: PublicationSortCriteria!, $profileId: ProfileId) {
		explorePublications(
			request: {
				limit: 25
				noRandomize: true
				sources: ["refract"]
				publicationTypes: [POST]
				sortCriteria: $sortCriteria
			}
		) {
			items {
				... on Post {
					id
					profile {
						handle
						onChainIdentity {
							worldcoin {
								isHuman
							}
						}
					}
					stats {
						totalAmountOfMirrors
						totalAmountOfComments
					}
					mirrors(by: $profileId)
					metadata {
						name
						content
					}
					createdAt
					referenceModule {
						__typename
						... on FollowOnlyReferenceModuleSettings {
							type
						}
					}
					appId
				}
			}
		}
	}
`

export default EXPLORE_PUBLICATIONS
