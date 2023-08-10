import { ReactNode } from "react";
import { GetStaticPaths, GetStaticProps } from "next";

import { marked } from "marked";
import { Params } from "@/config";
import { BlogsTypes } from "@/types";

import formatDate from "@/utils/formatDate";
import { NextPageWithLayout } from "../_app";
import blogService from "@/services/blog.services";
import MainLayout from "@/components/layouts/MainLayout";

interface BlogDetailPageProps {
    blog: BlogsTypes | null;
}

const BlogDetailPage: NextPageWithLayout<BlogDetailPageProps> = ({ blog }) => {
    // console.log("blog: ", blog);

    return (
        <>
            <div className="max-w-6xl w-full mx-auto px-10">

                {
                    blog && (
                        <>
                            <div>
                                <dl className="mb-1">
                                    <dt></dt>
                                    <dd>
                                        <time dateTime={`${blog.createdAt}`}>{formatDate(String(blog.createdAt))}</time>
                                    </dd>
                                    <h1 className="text-4xl">{blog.title}</h1>
                                </dl>
                                <div></div>
                            </div>
                            <div className="prose" dangerouslySetInnerHTML={{ __html: marked(blog.content) }} />
                        </>
                    )
                }

            </div>
        </>
    );
};

export default BlogDetailPage;

export const getStaticProps: GetStaticProps = async (context) => {
    const { slug } = context.params as Params;

    const blogRes = await blogService.findOne(slug);

    if (!blogRes?.success) {
        return {
            props: {
                blogs: null,
            },
        };
    }

    return {
        props: {
            blog: JSON.parse(JSON.stringify(blogRes.blog)),
        },
    };
};

export const getStaticPaths: GetStaticPaths<Params> = async () => {
    return { paths: [], fallback: true };
};

BlogDetailPage.getLayout = (page: ReactNode) => {
    return <MainLayout>{page}</MainLayout>;
};
