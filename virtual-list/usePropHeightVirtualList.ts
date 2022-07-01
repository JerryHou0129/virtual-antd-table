import { useState, useEffect, useRef } from 'react'

function binarySearch (list: number[], target: number): number {
  const length = list.length
  if (!length) return -1
  let result = -1
  let start = 0
  let end = length - 1
  while (start <= end) {
    if (start === end) return list[start] >= target ? start : -1
    const mid = (start + end) >> 1
    const midValue = list[mid]
    if (midValue === target) return mid
    if (target < midValue) {
      if (result === -1 || list[result] > midValue) {
        result = mid
      }
      end--
    } else {
      start = mid + 1
    }
  }
  return result
}

interface IParams<T> {
  data: any
  estimatedItemHeight?: number
  scrollTop: number
  clientHeight: number
  expandedIndexes: number[]
}

interface IPosition {
  height: number
  offset: number
}

// estimatedHeight will determine the rendered list length, the smaller the longer.
export default function usePropHeightVirtualList <T> ({
  data,
  estimatedItemHeight = 72,
  scrollTop,
  clientHeight,
  expandedIndexes
}: IParams<T>) {
  const [positions, setPositions] = useState<IPosition[]>([])

  // 以 `estimatedItemHeight` 初始化 `positions` 数组
  useEffect(() => {
    const initPositions: IPosition[] = []
    const length = data.length + expandedIndexes.length
    for (let i = 0; i < length; i++) {
      initPositions[i] = {
        height: estimatedItemHeight,
        offset: estimatedItemHeight + (initPositions[i - 1]?.offset || 0)
      }
    }
    setPositions(initPositions)
  }, [data.length, estimatedItemHeight, expandedIndexes.length])

  // 二分查找 `startIndex`
  const startIndex = binarySearch(positions.slice(0, Math.ceil(scrollTop / estimatedItemHeight) + 1).map((p) => p.offset), scrollTop)
  const endIndex = Math.ceil(clientHeight / estimatedItemHeight) + startIndex + 1

  const positionsRef = useRef<IPosition[]>()
  positionsRef.current = positions
  // 根据渲染的列表项，获取实际高度并更新 `positions` 数组
  useEffect(() => {
    if (!positionsRef.current || !positionsRef.current.length || startIndex === -1) return
    const positions = positionsRef.current
    const newPositions: IPosition[] = []
    let firstUpdatedIndex = -1
    const limit = Math.min(positions.length - 1, endIndex)
    // console.log('limit', limit)
    for (let i = startIndex; i <= limit; i++) {
      // change to 662 + 72
      const realHeight = expandedIndexes.includes(i) ? 662 + 72 : 72
      if (realHeight !== positions[i].height) {
        if (firstUpdatedIndex === -1) firstUpdatedIndex = i
        newPositions[i] = {
          height: realHeight,
          // 先随便赋个值，后面再统一更新
          offset: 0
        }
      }
    }
    if (firstUpdatedIndex !== -1) {
      // 有更新的节点
      positions.forEach((p, i) => {
        if (!newPositions[i]) newPositions[i] = p
      })
      // 从 `firstUpdatedIndex` 开始，更新后面的 `offset`
      const length = positions.length
      for (let i = firstUpdatedIndex; i < length; i++) {
        newPositions[i].offset = newPositions[i].height + (newPositions[i - 1]?.offset || 0)
      }
      setPositions(newPositions)
    }
  }, [data, endIndex, expandedIndexes, startIndex])

  return {
    startIndex,
    positions,
    totalHeight: positions[positions.length - 1]?.offset || 0,
    endIndex,
    offset: (positions[startIndex]?.offset || 0) - (positions[startIndex]?.height || 0)
  }
}
