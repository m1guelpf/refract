import omitDeep from 'omit-deep'

export const omit = (object: any, name: string) => omitDeep(object, name)
export const trimIndentedSpaces = (value: string): string => value?.replace(/\n\s*\n/g, '\n\n').trim()
