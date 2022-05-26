import { gql } from '@apollo/client'

const CREATE_COMMENT_SIG = gql`
	mutation CreateCommentTypedData($request: CreatePublicCommentRequest!) {
		createCommentTypedData(request: $request) {
			id
			expiresAt
			typedData {
				types {
					CommentWithSig {
						name
						type
					}
				}
				domain {
					name
					chainId
					version
					verifyingContract
				}
				value {
					nonce
					deadline
					profileId
					profileIdPointed
					pubIdPointed
					contentURI
					referenceModuleData
					collectModule
					collectModuleInitData
					referenceModule
					referenceModuleInitData
				}
			}
		}
	}
`

export default CREATE_COMMENT_SIG
