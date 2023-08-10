import { Fragment, ReactNode } from "react";
import { GetStaticProps } from "next";

import { Params } from "@/config";
import { BlogsTypes } from "@/types";
import { NextPageWithLayout } from "./_app";

import MainLayout from "@/components/layouts/MainLayout";
import blogService from "@/services/blog.services";
import ListNewBlogs from "@/components/share/Home/ListNewBlogs";

interface HomePageProps {
    blogs: BlogsTypes[] | null;
}

const HomePage: NextPageWithLayout<HomePageProps> = ({ blogs }) => {
    // console.log("blogs: ", blogs);

    return (
        <>
            <div className="max-w-4xl w-full mx-auto px-10">
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
    };
};

HomePage.getLayout = (page: ReactNode) => {
    return <MainLayout>{page}</MainLayout>;
};
