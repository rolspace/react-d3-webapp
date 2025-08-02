export enum RangeTypes {
  LOW = 'low',
  HIGH = 'high',
}

export interface RangeItem {
  min: number;
  max: number;
  count: number;
  label: string;
}

const lowRange: RangeItem[] = [
  { min: 1, max: 1, count: 0, label: '1' },
  { min: 2, max: 2, count: 0, label: '2' },
  { min: 3, max: 3, count: 0, label: '3' },
  { min: 4, max: 4, count: 0, label: '4' },
  { min: 5, max: 5, count: 0, label: '5' },
  { min: 6, max: 10, count: 0, label: '6-10' },
  { min: 11, max: 20, count: 0, label: '11-20' },
  { min: 21, max: 30, count: 0, label: '21-30' },
  { min: 30, max: 10000, count: 0, label: '30+' },
]

const highRange: RangeItem[] = [
  { min: 1, max: 20, count: 0, label: '1-20' },
  { min: 21, max: 40, count: 0, label: '21-40' },
  { min: 41, max: 60, count: 0, label: '41-60' },
  { min: 61, max: 80, count: 0, label: '61-80' },
  { min: 81, max: 100, count: 0, label: '81-100' },
  { min: 101, max: 500, count: 0, label: '101-500' },
  { min: 501, max: 1000, count: 0, label: '501-1000' },
  { min: 1001, max: 1500, count: 0, label: '1001-1500' },
  { min: 1500, max: 10000, count: 0, label: '1500+' },
]

// TODO: this is very suspect, should be replaced with a more robust type
type CollectionItem = {
  node: Record<string, any>;
}

type DataItem = Record<string, number>;

const assignToRange = (
  range: RangeItem[],
  property: string,
  value: CollectionItem
): RangeItem[] => {
  const found = range.find(
    (limit) =>
      limit.min <= value.node[property] && limit.max >= value.node[property],
  )

  if (found) {
    found.count++
  }

  return range
}

// Simple deep clone for arrays/objects (sufficient for this file's use)
const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
}


const createRange = (
  rangeType: RangeTypes,
  collection: CollectionItem[] | undefined,
  property: string
): RangeItem[] => {

  const startRange = deepClone(
    rangeType === RangeTypes.LOW ? lowRange : highRange
  )

  if (collection?.length) {
    const updatedGroup = collection.reduce((range, value) => {
      range = assignToRange(range, property, value)
      return range
    }, startRange)

    return updatedGroup
  }

  return startRange
}

// TODO: change to getLowRange
export const createLowRange = (
  collection: CollectionItem[] | undefined,
  property: string
): RangeItem[] => {
  const group = createRange(RangeTypes.LOW, collection, property)
  return group
}

// TODO: change to getHighRange
export const createHighRange = (
  collection: CollectionItem[] | undefined,
  property: string
): RangeItem[] => {
  const group = createRange(RangeTypes.HIGH, collection, property)
  return group
}
