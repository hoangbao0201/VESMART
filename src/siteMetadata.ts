const siteMetadata = {
    title: "Vesmart - Blog",
    author: "Vesmart",
    headerTitle: "Vesmart",
    description:
        "Một blog tập trung vào bán hàng và các công cụ phụ trợ khác cũng như kiến thức, dịch vụ",
    language: "vi-VN",
    theme: "light",
    siteUrl: "https://vesmart.online",
    siteRepo: "https://github.com/hoangbao0201/VESMART",
    siteLogo: "/static/images/logo-vesmart.png",
    image: "/static/images/avatar.png",
    socialBanner: "/static/images/thumbnail.png",
    github: "https://github.com/hoangbao0201",
    twitter: "https://twitter.com/bytomray",
    locale: "vi-VN",
    analytics: {
        plausibleDataDomain: "",
        simpleAnalytics: false,
        umamiWebsiteId: "",
        googleAnalyticsId: "",
    },
    newsletter: {
        provider: "buttondown",
    },
    comment: {
        provider: "giscus",
        giscusConfig: {
            repo: process.env.NEXT_PUBLIC_GISCUS_REPO,
            repositoryId: process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID,
            category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
            categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
            mapping: "pathname",
            reactions: "1",
            metadata: "0",
            theme: "light",
            darkTheme: "transparent_dark",
            themeURL: "",
            position: "top",
        },
        utterancesConfig: {
            repo: process.env.NEXT_PUBLIC_UTTERANCES_REPO,
            issueTerm: "",
            label: "",
            theme: "",
            darkTheme: "",
        },
        disqusConfig: {
            shortname: process.env.NEXT_PUBLIC_DISQUS_SHORTNAME,
        },
    },
};

export default siteMetadata;
