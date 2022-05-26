import { gql } from '@apollo/client'

const GET_POST_WITH_COMMENTS = gql`
	query PostWithComments($publicationId: InternalPublicationId!) {
		post: publication(request: { publicationId: $publicationId }) {
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
				appId
			}
		}
		comments: publications(request: { commentsOf: $publicationId }) {
			items {
				... on Comment {
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
				}
			}
		}
	}
`

export default GET_POST_WITH_COMMENTS
