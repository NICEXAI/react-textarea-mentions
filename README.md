# Textarea Mentions

### Install

```
npm i react-textarea-mentions
or
yarn add react-textarea-mentions
```

### Demo

![demo]('./example/demo.gif')

### Configurations

#### Options

| Name      | Type                  | Default      | Description                                                   |
| --------- | --------------------- | ------------ | ------------------------------------------------------------- |
| mentions  | TextareaMentionItem[] | []           | Mention list                                                  |
| enable    | boolean               | true         | Enable or disable textarea mentions                           |
| emptyText | string                | 'No results' | Empty text when no data                                       |
| collision | boolean               | true         | Whether to detect collision when the mention list is too long |

#### Events

| Name     | Params                                                    | Description                          |
| -------- | --------------------------------------------------------- | ------------------------------------ |
| onSelect | `(item: TextareaMentionItem, caretPos: CaretPos) => void` | Triggered when select a mention item |

### Usage

```tsx
import { TextareaMentions, autoCursorPos } from 'react-textarea-mentions'

const textareaRef = useRef<HTMLTextAreaElement>(null)
const mentions = [
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
]

return (
  <div className={style.exampleRoot}>
    <div className={style.box}>
      <div className={style.title}>Textarea Mentions Example</div>
      <div className={style.content}>
        <TextareaMentions
          mentions={mentions}
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
```

### License
Apache License 2.0