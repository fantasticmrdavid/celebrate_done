import { NextApiRequest, NextApiResponse } from 'next'
import axios from "axios";
import {processEnv} from "@next/env";

export const getQuotes = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const options = {
      method: 'GET',
      url: `https://api.api-ninjas.com/v1/quotes?category=dreams`,
      headers: {
        'X-Api-Key': process.env.API_NINJA_KEY,
      }
    };
    return axios.request(options).then((response) => {
      return res.status(200).json(response.data[0])
    }).catch(function (error) {
      console.error(error);
    });
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error })
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return await getQuotes(req, res)
  }
}
