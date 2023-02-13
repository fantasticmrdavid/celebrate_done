// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from "@/config/dbConnect"

type Data = {
    name: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    switch (req.method) {
        case "GET":
            return await getTest(req, res)
    }
}

const getTest = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const results = await dbConnect.query("SELECT * FROM users")
        await dbConnect.end()
        return res.status(200).json(results);
    } catch (error) {
        return res.status(500).json({ error });
    }
}
