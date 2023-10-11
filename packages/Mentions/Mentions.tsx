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
  getElement: () => HTMLDivElement | null
}

export interface MentionsProps {
  position: {
    top: number
    left: number
  }
  mentions: TextareaMention[]
  query?: string
  emptyText?: string
  infinite?: boolean
  styles?: CSSProperties
  onChange?: (items: TextareaMentionItem[]) => void
  onSelect?: (item: TextareaMentionItem) => void
}

const searchMentions = (q: string, data: TextareaMention[]) => {
  const newMentions: TextareaMention[] = []
  if (q === '') {
    return [...data]
  }
  for (let i = 0; i < data.length; i++) {
    const mention = data[i]
    if (mention.filter === false) {
      continue
    }
    const items = mention.items.filter((item) => {
      return item.label.toLowerCase().includes(q.toLowerCase())
    })
    if (items.length) {
      newMentions.push({ title: mention.title, items })
    }
  }
  return newMentions
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
      mentions: _mentions,
      query = '',
      emptyText = 'No results',
      infinite = true,
      styles,
      onChange,
      onSelect,
    },
    ref
  ) => {
    const [mentions, setMentions] = useState<TextareaMention[]>([])
    const [visible, setVisible] = useState(false)
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
            const behavior =
              targetIndex === 0 || targetIndex === nodes.length - 1 ? 'auto' : 'smooth'

            if (nodeHight + nodeTop > boxHeight + boxTop) {
              rootRef.current?.scrollTo({
                top: nodeHight + nodeTop - boxHeight + deviation,
                behavior,
              })
            } else if (nodeTop < boxTop) {
              rootRef.current?.scrollTo({
                top: nodeTop - deviation,
                behavior,
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
          if (!infinite && activeIndex <= 0) {
            return
          }
          const nIndex = activeIndex <= 0 ? total - 1 : activeIndex - 1
          updateLockRef.current = true
          setActiveIndex(nIndex)
          scrollIntoView(nIndex)
        },
        next: async () => {
          const total = getItemsFromMentions(mentions).length
          if (!infinite && activeIndex >= total - 1) {
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
        getElement: () => {
          return rootRef.current
        },
      }
    })

    useEffect(() => {
      const newMentions = searchMentions(query, _mentions)
      setMentions(newMentions)
      setActiveIndex(0)
      if (!visible && newMentions.length) {
        setVisible(true)
      }
      onChange?.(getItemsFromMentions(newMentions))
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_mentions, query])

    if (!visible) {
      return null
    }

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
                          searchWords={[query]}
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
