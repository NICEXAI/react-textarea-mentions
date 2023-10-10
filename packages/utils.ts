import getCaretCoordinates from 'textarea-caret'

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
