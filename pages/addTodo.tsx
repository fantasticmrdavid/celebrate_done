import React, {useState} from "react"
import { Button, Form, Input, Layout, Radio, Select, Typography } from "antd"
import axios from "axios"
import {Category} from "@/app/components/Category/types";
import {QueryKey, useQuery, useMutation} from "@tanstack/react-query";

const { Header } = Layout
const { Title } = Typography
const { Option } = Select

export enum TODO_SIZE {
    SMALL="SMALL",
    MEDIUM="MEDIUM",
    LARGE="LARGE",
}

const sizeList = [
    {
        label: "Small",
        value: TODO_SIZE.SMALL,
    },
    {
        label: "Medium",
        value: TODO_SIZE.MEDIUM,
    },
    {
        label: "Large",
        value: TODO_SIZE.LARGE,
    }
]

export const AddTodo = () => {
    const [name, setName] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [size, setSize] = useState<TODO_SIZE>(TODO_SIZE.MEDIUM)
    const [category, setCategory] = useState<Category | undefined>()

    const { isLoading: isFetchingCategories, error: categoriesError, data: categoriesData } =
        useQuery(['categoriesDataz'] as unknown as QueryKey, async () =>
        await fetch('/api/categories').then(res =>
            res.json()
        )
    )

    const saveTodo = useMutation({
        mutationFn: () => axios.post("/api/todos", {
            name,
            description,
            size,
            category,
        }),
        onSuccess: (res) => {
            console.log("SUCCESS: ", res)
        },
        onError: () => {
            console.log("ERROR")
        }
    })

    if (isFetchingCategories) return <div>LOADING CATEGORIES...</div>

    if (categoriesError) return <div>ERROR LOADING CATEGORIES...</div>

    const categoriesList: Category[] = categoriesData.map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        maxPerDay: c.maxPerDay
    }))

    return (
        <Layout>
            <Header>
                <Title level={2}>Add To-do</Title>
            </Header>
            <div>
                <Form.Item label={"Name"}>
                    <Input placeholder={"Enter the name for the to-do"} onChange={e => setName(e.target.value)} />
                </Form.Item>
                <Form.Item label={"Description"}>
                    <Input
                        placeholder={"Enter the description for the to-do"}
                        onChange={e => setDescription(e.target.value)}
                    />
                </Form.Item>
                <Form.Item label={"Size"}>
                    <Radio.Group
                        options={sizeList}
                        buttonStyle={"solid"}
                        optionType={"button"}
                        onChange={e => setSize(e.target.value)}
                    />
                </Form.Item>
                <Form.Item label={"Category"}>
                    <Select
                        onChange={(value => setCategory(categoriesList.find(c => c.id === value)))}
                        placeholder={"Select a category for the to-do"}
                        allowClear
                    >
                        { categoriesList.map(c => <Option key={`category_${c.id}`} value={c.id}>{c.name}</Option>)}
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Button
                        loading={saveTodo.isLoading}
                        disabled={saveTodo.isLoading}
                        onClick={() => saveTodo.mutate()}
                    >
                        Add To-do
                    </Button>
                </Form.Item>
            </div>
        </Layout>
    )
};

export default AddTodo
