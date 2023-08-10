// import prismaService from "@/libs/prismaService";


// export const getBlogs = async (qury: string) => {
//     try {
//         const blogs = await prismaService.blog.findMany({
//             select: {
//                 id: true,
//                 slug: true,
//                 title: true,
//                 thumbnail: true,
//                 authors: true,
//                 status: true,
//                 other_names: true,
//                 description: true,
//             },
//             orderBy: {
//                 createdAt: "desc"
//             }
//         });
    
//         return blogs;
//     } catch (error) {
//         if(axios.isAxiosError(error) && error.response?.data) {
//             return error.response.data;
//         } else {
//             return {
//                 success: false,
//                 message: (error as Error).message
//             };
//         }
//     }
// }

import prismaService from "@/libs/prismaService";

class BlogService {

    async findAll(query: any) {
        const { page = 0, limit = 10 } = query;

        try {
            const blogs = await prismaService.blog.findMany({
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    thumbnail: true,
                    author: {
                        select: {
                            id: true,
                            fullName: true,
                            username: true,
                            email: true
                        }
                    },
                    status: true,
                    description: true,
                    createdAt: true,
                    // updatedAt: true
                },
                orderBy: {
                    createdAt: "desc"
                },
                take: Number(limit) || 10,
                skip: Number(page) ? (page-1)*limit : 0
            });
        
            return {
                success: true,
                message: "Get blogs successful",
                blogs: blogs
            };
        } catch (error) {
            return {
                success: false,
                message: "error blogs successful",
                error: error
            };
        }
    }

    async findOne(slug: string) {
        try {
            const blog = await prismaService.blog.findFirst({
                where: {
                    slug: slug
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            fullName: true,
                            username: true,
                            email: true
                        }
                    }
                }
            })

            return {
                success: true,
                message: "Get blog successful",
                blog: blog
            };
        } catch (error) {
            return {
                success: false,
                message: "error blogs successful",
                error: error
            };
        }
    }
}

const blogService = new BlogService();

export default blogService;