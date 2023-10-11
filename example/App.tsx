import { useRef } from 'react'
import { TextareaMentions, autoCursorPos } from '../packages'
import style from './App.module.less'

function App() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  return (
    <div className={style.exampleRoot}>
      <div className={style.box}>
        <div className={style.title}>Textarea Mentions Example</div>
        <div className={style.content}>
          <TextareaMentions
            mentions={[
              {
                title: 'Friends',
                items: [
                  {
                    label: 'John',
                    value: 'John',
                  },
                  {
                    label: 'Jack',
                    value: 'Jack',
                  },
                  {
                    label: 'Tom',
                    value: 'Tom',
                  },
                ],
              },
            ]}
            onSelect={(item, caretPos) => {
              const originalContent = textareaRef.current?.value ?? ''
              if (caretPos) {
                const hasTriggerMarker = originalContent
                  .slice(caretPos.start, caretPos.end + 1)
                  .startsWith('/')
                if (hasTriggerMarker) {
                  const leftContent = originalContent.slice(0, caretPos.start)
                  const rightContent = originalContent.slice(caretPos.end + 1)

                  const textareaNode = textareaRef.current
                  if (textareaNode) {
                    textareaNode.value = leftContent + item.value + rightContent

                    setTimeout(() => {
                      autoCursorPos(textareaNode, leftContent.length + item.label.length, {
                        scrollIntoView: true,
                      })
                    }, 30)
                  }
                }
              }
            }}
          >
            <textarea ref={textareaRef} placeholder='Type / to mention'></textarea>
          </TextareaMentions>
        </div>
      </div>
    </div>
  )
}

export default App
