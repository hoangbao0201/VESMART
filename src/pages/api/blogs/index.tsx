import { NextApiRequest, NextApiResponse } from "next";
import blogService from "@/services/blog.services";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    
    if (req.method !== "POST") {
        return res.status(405).end();
    }
    
    const data = req.body;

    const createBlog = await blogService.createBlog("64d39a038ecc99b24ffe78f1", data)

    return res.send(createBlog);
};

export default handler;