import React from "react"
import {QueryKey, useQuery} from "@tanstack/react-query";
import { TODO } from "@/app/components/Todo/types";

export const TodoList = () => {
    const { isLoading, error, data: todoList } = useQuery(['getTodos'] as unknown as QueryKey, async () =>
        await fetch('/api/todos').then(res =>
            res.json()
        )
    )

    if (isLoading) return <div>LOADING TODOS...</div>

    if (error) return <div>ERROR FETCHING TODOS...</div>

    return (
        <div>
            {(todoList).map((t: TODO) => (
                <div key={`todo_${t.id}`}>
                    { t.name}
                </div>
            ))}
        </div>
    )
}
