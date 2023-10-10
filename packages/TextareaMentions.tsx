import {
  ChangeEvent,
  MouseEvent,
  ReactElement,
  cloneElement,
  useEffect,
  useRef,
  useState,
} from 'react'
import getCaretCoordinates from 'textarea-caret'
import { Mentions, MentionsRef, TextareaMention, TextareaMentionItem } from './Mentions'
import style from './TextareaMentions.module.less'

interface TextareaMentionsState {
  query: string
  leftIndex: number
  caretPosition: number
  suggestionVisible: boolean
  suggestionsPosition: {
    top: number
    left: number
  }
  counter: number
}

const DEFAULT_TEXTAREA_MENTIONS_STATE: TextareaMentionsState = {
  query: '',
  leftIndex: -1,
  caretPosition: -1,
  suggestionVisible: false,
  suggestionsPosition: {
    top: 0,
    left: 0,
  },
  counter: 0,
}

export interface TextareaMentionsCaretPosition {
  start: number
  end: number
}

export interface TextareaMentionsProps {
  children: ReactElement
  mentions: TextareaMention[]
  emptyText?: string
  enable?: boolean
  collision?: boolean
  onSelect?: (item: TextareaMentionItem, caretPosition?: TextareaMentionsCaretPosition) => void
}

export function TextareaMentions(props: TextareaMentionsProps) {
  const { children, enable = true, collision, onSelect } = props
  const [mentionsState, setMentionsState] = useState(DEFAULT_TEXTAREA_MENTIONS_STATE)
  const mentionItems = useRef<TextareaMentionItem[]>([])
  const mentionsRef = useRef<MentionsRef>(null)
  const caretPosRef = useRef<TextareaMentionsCaretPosition>()

  useEffect(() => {
    const closeMentionsHandler = () => {
      if (mentionsState.suggestionVisible) {
        setMentionsState(DEFAULT_TEXTAREA_MENTIONS_STATE)
      }
    }
    window.addEventListener('click', closeMentionsHandler)

    return () => {
      window.removeEventListener('click', closeMentionsHandler)
    }
  }, [mentionsState.suggestionVisible])

  if (!enable) {
    return children
  }

  return (
    <div className={style.textareaMentions}>
      {cloneElement(children, {
        ...children.props,
        onKeyDown: (e: KeyboardEvent) => {
          switch (e.key) {
            case 'ArrowUp':
            case 'ArrowDown':
              if (mentionsState.suggestionVisible) {
                e.preventDefault()
              }
              if (e.key === 'ArrowUp') {
                mentionsRef.current?.prev()
              } else {
                mentionsRef.current?.next()
              }
              break
            case 'Tab':
            case 'Enter':
              if (mentionsState.suggestionVisible) {
                e.preventDefault()
                if (mentionItems.current.length) {
                  mentionsRef.current?.select()
                }
                return
              }
              break
            case 'Escape':
              setMentionsState(DEFAULT_TEXTAREA_MENTIONS_STATE)
              break
            default:
              break
          }

          children.props?.onKeyDown?.(e)
        },
        onInput: (e: ChangeEvent<HTMLTextAreaElement>) => {
          children.props?.onInput?.(e)
          const inputNode = e.target
          const caretPosition = inputNode.selectionStart
          const value = inputNode.value

          let leftIndex = caretPosition
          while (leftIndex > 0) {
            leftIndex -= 1
            if (/\s/.test(value[leftIndex])) {
              leftIndex += 1
              break
            }
          }

          const triggerMarker = '/'
          let suggestionVisible = false
          let query = value.substring(leftIndex, caretPosition)
          if (query.length > 0 && query[0] === triggerMarker) {
            suggestionVisible = true
            query = query.length > 1 ? query.substring(1) : ''
            caretPosRef.current = { start: leftIndex, end: leftIndex + query.length }
          }

          const suggestionsPosition: TextareaMentionsState['suggestionsPosition'] = {
            top: 0,
            left: 0,
          }

          // calc suggestions position and open mentions
          if (!mentionsState.suggestionVisible && suggestionVisible) {
            const { top, left } = getCaretCoordinates(inputNode, leftIndex + 1)
            suggestionsPosition.top = top - inputNode.scrollTop

            const offsetLeft = left - inputNode.scrollLeft
            const mentionNode = mentionsRef.current?.getElement()
            if (mentionNode) {
              const mentionNodeWidth = mentionNode.offsetWidth
              if (collision && offsetLeft + mentionNodeWidth > inputNode.offsetWidth) {
                suggestionsPosition.left = inputNode.offsetWidth - mentionNodeWidth
              } else {
                suggestionsPosition.left = offsetLeft
              }
            }

            const newMentionsState = {
              query,
              leftIndex,
              caretPosition,
              suggestionVisible,
              suggestionsPosition,
              counter: 0,
            }
            setMentionsState(newMentionsState)
            return
          }

          // update mentions
          if (mentionsState.suggestionVisible && suggestionVisible) {
            setMentionsState({
              ...mentionsState,
              query,
              suggestionVisible: mentionsState.counter < 2,
              counter:
                mentionsState.query.length < query.length && mentionItems.current.length === 0
                  ? mentionsState.counter + 1
                  : 0,
            })
          }

          // close mentions
          if (mentionsState.suggestionVisible && !suggestionVisible) {
            setMentionsState(DEFAULT_TEXTAREA_MENTIONS_STATE)
          }
        },
        onClick: (e: MouseEvent<HTMLTextAreaElement>) => {
          children.props?.onClick?.(e)
          setMentionsState(DEFAULT_TEXTAREA_MENTIONS_STATE)
        },
      })}

      {/* mentions */}
      <Mentions
        {...props}
        ref={mentionsRef}
        styles={{ visibility: mentionsState.suggestionVisible ? 'visible' : 'hidden' }}
        position={mentionsState.suggestionsPosition}
        query={mentionsState.query}
        onChange={(items) => {
          mentionItems.current = items
        }}
        onSelect={(item) => {
          onSelect?.(item, caretPosRef.current)
          setMentionsState(DEFAULT_TEXTAREA_MENTIONS_STATE)
        }}
      />
    </div>
  )
}
