import { NextApiRequest, NextApiResponse } from "next";
import blogService from "@/services/blog.services";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    
    if (req.method !== "PATCH") {
        return res.status(405).end();
    }
    
    const data = req.body;
    const { id } = req.query;

    const updateBlog = await blogService.update(String(id), data);

    return res.send(updateBlog);
};

export default handler;