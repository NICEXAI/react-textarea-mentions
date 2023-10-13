import classNames from 'classnames'
import { CSSProperties, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import Highlight from 'react-highlight-words'
import style from './Mentions.module.less'

export interface TextareaMentionItem {
  label: string
  value: string | number
}

export interface TextareaMention {
  // group title
  title: string
  items: TextareaMentionItem[]
  // enable filter, default true
  filter?: boolean
}

export interface MentionsRef {
  prev: () => void
  next: () => void
  select: () => void
  reset: () => void
  getElement: () => HTMLDivElement | null
}

export interface MentionsProps {
  position: {
    top: number
    left: number
  }
  mentions: TextareaMention[]
  keyword?: string
  emptyText?: string
  styles?: CSSProperties
  scrollOptions?: {
    infinite: boolean
  }
  onSelect?: (item: TextareaMentionItem) => void
}

const getItemsFromMentions = (data: TextareaMention[]) => {
  const items: TextareaMentionItem[] = []
  for (let i = 0; i < data.length; i++) {
    items.push(...data[i].items)
  }
  return items
}

export const Mentions = forwardRef<MentionsRef, MentionsProps>(
  (
    {
      position,
      mentions,
      keyword = '',
      emptyText = 'No results',
      styles,
      scrollOptions = {
        infinite: false,
      },
      onSelect,
    },
    ref
  ) => {
    const [activeIndex, setActiveIndex] = useState(0)
    const rootRef = useRef<HTMLDivElement>(null)
    const scrollTimerRef = useRef<number>()

    // prevent keyboard event and mouse event conflict
    const lockTimerRef = useRef<number>()
    const updateLockRef = useRef(false)

    const scrollIntoView = (targetIndex: number) => {
      return new Promise((resolve) => {
        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current)
        }
        scrollTimerRef.current = setTimeout(() => {
          const nodes = rootRef.current?.querySelectorAll('div[data-index]') ?? []
          if (targetIndex < nodes.length) {
            const deviation = 10
            const node = nodes[targetIndex] as HTMLDivElement
            const boxHeight = rootRef.current?.offsetHeight ?? 0
            const boxTop = rootRef.current?.scrollTop ?? 0
            const { offsetTop: nodeTop, offsetHeight: nodeHight } = node

            if (nodeHight + nodeTop > boxHeight + boxTop) {
              rootRef.current?.scrollTo({
                top: targetIndex === 0 ? 0 : nodeHight + nodeTop - boxHeight + deviation,
              })
            } else if (nodeTop < boxTop) {
              rootRef.current?.scrollTo({
                top: targetIndex === 0 ? 0 : nodeTop - deviation,
              })
            }

            resolve(true)
          }
        }, 10) as unknown as number

        if (updateLockRef.current) {
          clearTimeout(lockTimerRef.current)
        }
        lockTimerRef.current = setTimeout(() => {
          updateLockRef.current = false
        }, 1000) as unknown as number
      })
    }

    useImperativeHandle(ref, () => {
      return {
        prev: () => {
          const total = getItemsFromMentions(mentions).length
          if (!scrollOptions.infinite && activeIndex <= 0) {
            return
          }
          const nIndex = activeIndex <= 0 ? total - 1 : activeIndex - 1
          updateLockRef.current = true
          setActiveIndex(nIndex)
          scrollIntoView(nIndex)
        },
        next: async () => {
          const total = getItemsFromMentions(mentions).length
          if (!scrollOptions.infinite && activeIndex >= total - 1) {
            return
          }
          const nIndex = activeIndex >= total - 1 ? 0 : activeIndex + 1
          updateLockRef.current = true
          setActiveIndex(nIndex)
          scrollIntoView(nIndex)
        },
        select: () => {
          const items = getItemsFromMentions(mentions)
          if (activeIndex < items.length) {
            onSelect?.(items[activeIndex])
          }
        },
        reset: () => {
          setActiveIndex(0)
          if (rootRef.current) {
            rootRef.current.scrollTop = 0
          }
        },
        getElement: () => {
          return rootRef.current
        },
      }
    })

    useEffect(() => {
      setActiveIndex(0)
    }, [mentions])

    let currentIndex = -1

    return (
      <div
        ref={rootRef}
        className={style.mentions}
        style={{ ...styles, ...position }}
        onClick={(e) => e.stopPropagation()}
      >
        {mentions.map((mention, _mIndex) => {
          return (
            <div key={_mIndex}>
              {_mIndex !== 0 && (
                <div className={style.divider}>
                  <div className={style.dividerLine}></div>
                </div>
              )}
              <div className={style.group}>
                <div className={style.title}>{mention.title}</div>
                <div className={style.content}>
                  {mention.items.map((item, _iIndex) => {
                    const cIndex = (currentIndex += 1)
                    return (
                      <div
                        key={_iIndex}
                        data-index={`${_mIndex}_${_iIndex}`}
                        className={classNames(style.item, {
                          [style.active]: currentIndex === activeIndex,
                        })}
                        onClick={() => {
                          onSelect?.(item)
                        }}
                        onMouseEnter={() => {
                          if (updateLockRef.current) {
                            return
                          }
                          setActiveIndex(cIndex)
                        }}
                      >
                        <Highlight
                          textToHighlight={item.label}
                          highlightClassName={style.highlight}
                          searchWords={[keyword]}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
        {!mentions.length && <div className={style.empty}>{emptyText}</div>}
      </div>
    )
  }
)

Mentions.displayName = 'Mentions'
