export const encode = (str) => Buffer.from(str).toString('hex')
export const decode = (bytes) => Buffer.from(bytes, 'hex').toString();