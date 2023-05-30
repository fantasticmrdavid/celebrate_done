import React from "react";
import {useDrop} from "react-dnd";
import {DRAGGABLE_TYPE} from "@/app/constants/constants";
import styles from "./todoDropZone.module.scss"
import classNames from "classnames";
import {Todo} from "@/app/components/TodoItem/types";
import {arrayMoveImmutable} from 'array-move';
import {useMutation, useQueryClient} from "@tanstack/react-query";
import axios from "axios";
import {notification} from "antd";

type Props = {
  position: number,
  todoList: Todo[],
  onSort: (todoList: Todo[]) => any,
  currentDate: string
}

type SortTodoListParams = {
  todoList: Todo[]
}

export const TodoDropZone = ({ position, todoList, onSort, currentDate }: Props) => {
  const queryClient = useQueryClient()
    const updateTodoSortOrder = (item: Todo) => {
      const sortedTodoList: Todo[] = arrayMoveImmutable(todoList, todoList.findIndex(t => t.id === item.id), position)
      sortTodoList.mutate({
        todoList: sortedTodoList
      })
    }

  const sortTodoList = useMutation({
    mutationFn: (req: SortTodoListParams) =>
      axios.patch('/api/todos', {
        todoList: req.todoList,
        action: 'updateSortOrder',
      }),
    onMutate: async (req) => {
      return onSort(req.todoList)
    },
    onError: (error) => {
      console.log('ERROR: ', error)
      notification.error({
        message: <>Error sorting todo list. Check console for details.</>,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries(['getTodos', currentDate])
    },
  })

    const [{ isOver }, drop] = useDrop(
        () => ({
            accept: DRAGGABLE_TYPE.TODO,
            drop: (item) => updateTodoSortOrder(item as Todo),
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                dropResult: monitor.getDropResult()
            })
        }), [ position ]
    )

    const classes = classNames({
        [styles.container]: true,
        [styles.isDroppable]: isOver,
    })

    return (
        <div ref={drop} className={classes} />
    )
}