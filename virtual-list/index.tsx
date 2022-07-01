/* eslint-disable arrow-body-style */
import React, {
  useRef,
  useContext,
  createContext,
  useState,
  useMemo,
  useCallback
} from 'react'

import './style.css'
import usePropHeightVirtualList from 'virtual-list/usePropHeightVirtualList'

const ScrollContext = createContext({
  startIndex: 0,
  endIndex: 0
})

function VWrapper (props: any): JSX.Element {
  const { children, ...restProps } = props

  const { startIndex, endIndex } = useContext(ScrollContext)

  const contents = useMemo(() => {
    return children[1]
  }, [children])

  let tempNode = null
  if (Array.isArray(contents) && contents.length) {
    tempNode = [
      children[0],
      contents.slice(startIndex, endIndex + 1 + 2).map((item) => {
        if (Array.isArray(item)) {
          return item[0]
        }
        return item
      })
    ]
  } else {
    tempNode = children
  }
  return <tbody {...restProps}>{tempNode}</tbody>
}

function VTable (props: any, otherParams): JSX.Element {
  const { style, children, ...rest } = props
  const { width, ...rest_style } = style
  const { dataSource, isViewAll } = otherParams ?? {}

  const tableRef = useRef<HTMLTableElement>(null)

  const expandedKeys = children[1].props.expandedKeys ?? 0

  const [scrollTop, setScrollTop] = useState(0)
  const [clientHeight, setClientHeight] = useState(0)

  const expandedIndexes = []
  expandedKeys.forEach(key => {
    const index = children[1]?.props?.data?.findIndex(each => each.metaData.id === key)
    expandedIndexes.push(index)
  })
  const { totalHeight, startIndex, endIndex, offset } = usePropHeightVirtualList({
    data: dataSource,
    scrollTop,
    clientHeight,
    expandedIndexes,
    estimatedItemHeight: isViewAll ? 662 + 72 : 72
  })

  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop)
    }
  }, [])

  const containerRefCallback = useCallback((node: HTMLDivElement) => {
    if (node) {
      containerRef.current = node
      setClientHeight(node.clientHeight)
    } else {
      containerRef.current = null
    }
  }, [])

  return (
    <div className='container' ref={containerRefCallback} onScroll={handleScroll}>
      <ScrollContext.Provider value={{ startIndex, endIndex }}>
        <div className='total-list' style={{ height: `${totalHeight}px` }}></div>
        <table
          {...rest}
          ref={tableRef}
          style={{
            ...rest_style,
            width,
            position: 'relative',
            transform: `translateY(${offset}px)`
          }}
        >
          {children}
        </table>
      </ScrollContext.Provider>
    </div>
  )
}

export function VList (props: {
  dataSource: any
  isViewAll: boolean
}): any {
  const { dataSource, isViewAll } = props

  return {
    table: (p) =>
      VTable(p, {
        dataSource,
        isViewAll
      }),
    body: {
      wrapper: VWrapper
    }
  }
}
