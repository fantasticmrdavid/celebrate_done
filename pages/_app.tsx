import React from 'react'
import type { AppProps } from "next/app"
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'

export default function MyApp({ Component, pageProps }: AppProps) {
    const [queryClient] = React.useState(() => new QueryClient())

    return (
        <QueryClientProvider client={queryClient}>
            <Component {...pageProps} />
        </QueryClientProvider>
    )
}
