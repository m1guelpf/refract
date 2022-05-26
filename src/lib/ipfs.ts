import { create } from 'ipfs-http-client'

const client = create({
	host: 'ipfs.infura.io',
	port: 5001,
	protocol: 'https',
})

const uploadToIPFS = async <T>(data: T): Promise<string> => {
	const result = await client.add(JSON.stringify(data))

	return result.path
}

export default uploadToIPFS
