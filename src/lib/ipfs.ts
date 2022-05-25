import { Web3Storage } from 'web3.storage'

const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_IPFS_TOKEN })

const uploadToIPFS = (data: any): Promise<string> => {
	return client.put([new File([JSON.stringify(data)], 'meta.json', { type: 'application/json' })])
}

export default uploadToIPFS
