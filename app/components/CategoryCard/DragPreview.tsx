import type { CSSProperties, FC } from 'react'
import { memo } from 'react'

import { TodoItem } from '../TodoItem/Todo'
import {Todo} from "@/app/components/TodoItem/types";

const styles: CSSProperties = {
  display: 'inline-block',
  transform: 'rotate(-7deg)',
}

export interface BoxDragPreviewProps {
  todo: Todo
}

export const DragPreview: FC<BoxDragPreviewProps> = memo(
  function DragPreview({ todo }) {
    return (
      <div style={styles}>
        <TodoItem todo={todo} currentDate={""} />
      </div>
    )
  },
)