// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from "@/config/dbConnect"
import {TODO_STATUS} from "@/app/components/Todo/types";

type Data = {
    name: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    switch (req.method) {
        case "GET":
            return await getTodos(req, res)
        case "POST":
            return await addTodo(req, res)
    }
}

const getTodos = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const results = await dbConnect.query(
            "SELECT id, created, name, description, size, status, completed FROM todos"
        )
        await dbConnect.end()
        return res.status(200).json(results);
    } catch (error) {
        return res.status(500).json({ error });
    }
}

const addTodo = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const {
            name,
            description,
            size,
            category
        } = req.body
        const insertTodoQuery = `INSERT into todos
            VALUES (
                null,
                null,
                '${name}',
                '${description}',
                '${size}',
                '${TODO_STATUS.INCOMPLETE}',
                null
            )`
        try {
            const todoResult = await dbConnect.transaction()
                .query(insertTodoQuery)
                .query((r: any) => {
                    if (r.affectedRows === 1) {
                        return [`INSERT into todos_to_categories VALUES(null, ${r.insertId}, ${category.id})`]
                    } else {
                        return null
                    }
                })
                .rollback((e: any) => console.error(e))
                .commit()
            const result = todoResult
            await dbConnect.end()
            return res.status(200).json(result);
        } catch (e) {
            throw e
        }
    } catch (error) {
        console.log("SQL ERROR: ", error)
        return res.status(500).json({ error });
    }
}
