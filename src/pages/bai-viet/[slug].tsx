import { ReactNode } from "react";
import { GetStaticPaths, GetStaticProps } from "next";

import { marked } from "marked";
import { Params } from "@/config";
import { BlogTypes } from "@/types";

import formatDate from "@/utils/formatDate";
import { NextPageWithLayout } from "../_app";
import blogService from "@/services/blog.services";
import MainLayout from "@/components/layouts/MainLayout";
import { BlogSEO } from "@/components/share/SEO";
import siteMetadata from "@/siteMetadata";

interface BlogDetailPageProps {
    blog: BlogTypes | null;
}

const BlogDetailPage: NextPageWithLayout<BlogDetailPageProps> = ({ blog }) => {
    console.log("blog: ", blog);

    return (
        <>
            <div className="max-w-5xl min-h-screen w-full mx-auto px-4">

                <div className="-mx-4 flex">
                    <div className="lg:w-8/12 w-full px-4 mx-auto pt-6 pb-8">
                        {
                            blog && (
                                <>
                                    <BlogSEO
                                        title={blog.title}
                                        url={`${siteMetadata.siteUrl}/bai-viet/${blog.slug}`}
                                        canonicalUrl={`${siteMetadata.siteUrl}/bai-viet/${blog.slug}`}
                                        author={blog.author.fullName || siteMetadata.author}
                                        isHiddenFromSearch={false}
                                        summary={blog.description}
                                        

                                        createdAt={blog.createdAt}
                                        updatedAt={blog.updatedAt}

                                    />
                                    <dl className="">
                                        <dt></dt>
                                        <dd className="">
                                            <time dateTime={`${blog.createdAt}`}>{formatDate(String(blog.createdAt))}</time>
                                        </dd>
                                        <h1 className="my-5 text-4xl text-left font-extrabold">{blog.title}</h1>
                                    </dl>
                                    <div className="prose contents" dangerouslySetInnerHTML={{ __html: marked(blog.content) }} />
                                </>
                            )
                        }
                    </div>
                    <div className="w-4/12 px-4 sticky top-0 h-screen pt-6 hidden lg:block">
                        <div className="w-full rounded-md h-40 mb-3 bg-gray-100"></div>
                        <div className="w-full rounded-md h-40 mb-3 bg-gray-100"></div>
                        <div className="w-full rounded-md h-40 mb-3 bg-gray-100"></div>
                    </div>
                </div>

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
        revalidate: 60*60
    };
};

export const getStaticPaths: GetStaticPaths<Params> = async () => {
    return { paths: [], fallback: true };
};

BlogDetailPage.getLayout = (page: ReactNode) => {
    return <MainLayout>{page}</MainLayout>;
};
