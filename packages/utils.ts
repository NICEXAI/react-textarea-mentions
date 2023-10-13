import getCaretCoordinates from 'textarea-caret'
import { TextareaMention } from './Mentions'

interface autoCursorPosOptions {
  // Whether to scroll to the cursor position
  scrollIntoView?: boolean
}

/**
 * autoCursorPos
 *
 * @param textarea element
 * @param cursorPos cursor position
 * @param options
 */
export function autoCursorPos(
  textarea: HTMLTextAreaElement,
  cursorPos: number,
  options?: autoCursorPosOptions
) {
  if (!textarea) return

  textarea.focus()
  textarea.setSelectionRange(cursorPos, cursorPos)

  if (options?.scrollIntoView) {
    const { top, height } = getCaretCoordinates(textarea, cursorPos)
    const offsetTop = top + height
    textarea.scrollTop = Math.max(0, offsetTop - textarea.clientHeight)
  }
}

/**
 * search mentions
 * @param q
 * @param data
 * @returns
 */
export function searchMentions(q: string, data: TextareaMention[]) {
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
