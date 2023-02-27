import React from "react"
import { Layout, Typography } from "antd"
import { TodoList } from "@/app/components/TodoList/TodoList"

const { Header } = Layout
const { Title } = Typography

export const TodosPage = () => {
    return (
        <Layout>
            <Header>
                <Title level={2}>{`To-Do's`}</Title>
            </Header>
            <TodoList />
        </Layout>
    )
};

export default TodosPage
