export const cloneDeep = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
}

export const get = (obj: any, path: string): any => {
  return path
    .split('.')
    .reduce((acc, part) => (acc && acc[part] !== 'undefined' ? acc[part] : undefined), obj)
}
