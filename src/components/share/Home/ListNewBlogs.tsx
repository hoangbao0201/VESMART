import { BlogTypes } from "@/types";
import formatDate from "@/utils/formatDate";
import Link from "next/link";


interface ListNewBlogsProps {
    blogs: BlogTypes[] | null;
}

const ListNewBlogs = ({ blogs } : ListNewBlogsProps) => {

    // console.log(blogs)

    return (
        <ul className="grid">
            {
                blogs && blogs.length && blogs.map(blog => {
                    return (
                        <li key={blog.id} className="py-6">
                            <article>
                                <div>
                                    <div>
                                        <dl className="mb-1">
                                            <dt></dt>
                                            <dd>
                                                <time dateTime={`${blog.createdAt}`}>{formatDate(String(blog.createdAt))}</time>
                                            </dd>
                                        </dl>
                                        <div className="mb-5">
                                            <div className="mb-3">
                                                <h2 className="text-2xl font-bold leading-8 tracking-tight">
                                                    <Link className="text-primary-500 line-clamp-2" href={`/bai-viet/${blog.slug}`}>{blog.title}</Link>
                                                </h2>
                                            </div>

                                            <div className="text-lg text-gray-600 font-normal">{blog.description}</div>
                                        </div>

                                        <div className="flex text-lg text-gray-600">
                                            <Link className="px-5 py-[8px] rounded-full font-medium leading-6 bg-slate-100 hover:bg-slate-200 " href={`/bai-viet/${blog.slug}`}>Đọc thêm →</Link>
                                        </div>

                                    </div>
                                    
                                </div>
                            </article>
                        </li>
                    )
                })
            }
        </ul>
    )
}

export default ListNewBlogs;