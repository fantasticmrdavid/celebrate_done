import React from "react"
import {useQuery, QueryKey} from "@tanstack/react-query";

export const Test = () => {
    const { isLoading, error, data } = useQuery(['testData'] as unknown as QueryKey, async () =>
        await fetch('/api/test').then(res =>
            res.json()
        )
    )

    if (isLoading) return <div>LOADING...</div>

    if (error) return <div>ERROR...</div>

    return (
        <div>TEST: ${JSON.stringify(data)}</div>
    )
};

export default Test
