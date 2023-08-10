import { Fragment, ReactNode } from "react";
import { GetStaticPaths, GetStaticProps } from "next";

import { Params } from "@/config";
import { BlogsTypes } from "@/types";

import MainLayout from "@/components/layouts/MainLayout";
import blogService from "@/services/blog.services";
import { NextPageWithLayout } from "../_app";
import { marked } from "marked";

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
