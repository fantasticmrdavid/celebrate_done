export enum TODO_SIZE {
    SMALL="SMALL",
    MEDIUM="MEDIUM",
    LARGE="LARGE",
}

export enum TODO_STATUS {
    INCOMPLETE = "INCOMPLETE",
    DONE = "DONE"
}

export type TODO = {
    id?: number
    created: string
    startDate: string
    name: string
    description: string
    size: TODO_SIZE
    status: TODO_STATUS
    completedDate: string
}

