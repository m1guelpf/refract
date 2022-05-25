export const APP_NAME = 'Refract'
export const IS_MAINNET = process.env.NODE_ENV === 'production'
export const API_URL = IS_MAINNET ? 'https://api.lens.dev' : 'https://api-mumbai.lens.dev'
export const ERROR_MESSAGE = 'Something went wrong! Please try again'

export const LENSHUB_PROXY = IS_MAINNET
	? '0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d'
	: '0x60Ae865ee4C725cd04353b5AAb364553f56ceF82'
