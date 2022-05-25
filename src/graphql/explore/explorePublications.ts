import { gql } from '@apollo/client'

const EXPLORE_PUBLICATIONS = gql`
	query ($sortCriteria: PublicationSortCriteria!) {
		explorePublications(
			request: {
				sortCriteria: $sortCriteria
				publicationTypes: [POST]
				limit: 25
				noRandomize: true
				sources: ["refract"]
			}
		) {
			items {
				... on Post {
					id
					profile {
						handle
					}
					stats {
						totalAmountOfMirrors
						totalAmountOfComments
					}
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
