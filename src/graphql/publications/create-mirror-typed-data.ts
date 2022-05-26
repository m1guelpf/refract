import { gql } from '@apollo/client'

const CREATE_MIRROR_SIG = gql`
	mutation ($profileId: ProfileId!, $publicationId: InternalPublicationId!) {
		createMirrorTypedData(
			request: {
				profileId: $profileId
				publicationId: $publicationId
				referenceModule: { followerOnlyReferenceModule: false }
			}
		) {
			id
			expiresAt
			typedData {
				types {
					MirrorWithSig {
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
					referenceModule
					referenceModuleData
					referenceModuleInitData
				}
			}
		}
	}
`

export default CREATE_MIRROR_SIG
