import { Fragment, ReactNode } from "react";
import { GetStaticProps } from "next";

import { Params } from "@/config";
import { BlogTypes } from "@/types";
import { NextPageWithLayout } from "./_app";

import MainLayout from "@/components/layouts/MainLayout";
import blogService from "@/services/blog.services";
import ListNewBlogs from "@/components/share/Home/ListNewBlogs";
import { PageSEO } from "@/components/share/SEO";
import siteMetadata from "@/siteMetadata";

interface HomePageProps {
    blogs: BlogTypes[] | null;
}

const HomePage: NextPageWithLayout<HomePageProps> = ({ blogs }) => {
    // console.log("blogs: ", blogs);

    return (
        <>
            <PageSEO
                title="Trang chủ - VESMART"
                description={siteMetadata.description}
            />
            <div className="max-w-4xl w-full mx-auto px-4">
                <ListNewBlogs blogs={blogs}/>
            </div>
        </>
    );
};

export default HomePage;

export const getStaticProps: GetStaticProps = async (context) => {
    // const { query } = context.params as Params;

    const blogsRes = await blogService.findAll({
        page: 1,
        limit: 10,
    });

    if (!blogsRes?.success) {
        return {
            props: {
                blogs: null,
            },
        };
    }

    return {
        props: {
            blogs: JSON.parse(JSON.stringify(blogsRes.blogs)),
        },
        revalidate: 60*5
    };
};

HomePage.getLayout = (page: ReactNode) => {
    return <MainLayout>{page}</MainLayout>;
};
