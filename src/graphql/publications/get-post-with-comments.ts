import { gql } from '@apollo/client'

const GET_POST_WITH_COMMENTS = gql`
	query PostWithComments($publicationId: InternalPublicationId!, $profileId: ProfileId) {
		post: publication(request: { publicationId: $publicationId }) {
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
				appId
			}
		}
		comments: publications(request: { commentsOf: $publicationId }) {
			items {
				... on Comment {
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
				}
			}
		}
	}
`

export default GET_POST_WITH_COMMENTS
