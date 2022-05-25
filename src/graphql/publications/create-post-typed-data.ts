import { gql } from '@apollo/client'

const CREATE_POST_SIG = gql`
	mutation CreatePostTypedData($request: CreatePublicPostRequest!) {
		createPostTypedData(request: $request) {
			id
			expiresAt
			typedData {
				types {
					PostWithSig {
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
					contentURI
					collectModule
					collectModuleInitData
					referenceModule
					referenceModuleInitData
				}
			}
		}
	}
`

export default CREATE_POST_SIG
