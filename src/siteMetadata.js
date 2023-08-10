const siteMetadata = {
    title: 'Vesmart - Blogs',
    author: 'Vesmart',
    headerTitle: 'Vesmart',
    description: 'A blog focused on NodeJs, Typescript and other backend tools and learnings',
    language: 'en-us',
    theme: 'light',
    siteUrl: 'https://www.tomray.dev',
    siteRepo: 'https://github.com/tomwray13/tomray.dev',
    siteLogo: '/static/images/profile.jpg',
    image: '/static/images/avatar.png',
    socialBanner: '/static/images/twitter-card.png',
    github: 'https://github.com/tomwray13',
    twitter: 'https://twitter.com/bytomray',
    locale: 'en-US',
    analytics: {
      plausibleDataDomain: '',
      simpleAnalytics: false,
      umamiWebsiteId: '',
      googleAnalyticsId: '',
    },
    newsletter: {
      provider: 'buttondown',
    },
    comment: {
      provider: 'giscus',
      giscusConfig: {
        repo: process.env.NEXT_PUBLIC_GISCUS_REPO,
        repositoryId: process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID,
        category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
        categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
        mapping: 'pathname',
        reactions: '1',
        metadata: '0',
        theme: 'light',
        darkTheme: 'transparent_dark',
        themeURL: '',
        position: 'top',
      },
      utterancesConfig: {
        repo: process.env.NEXT_PUBLIC_UTTERANCES_REPO,
        issueTerm: '',
        label: '',
        theme: '',
        darkTheme: '',
      },
      disqusConfig: {
        shortname: process.env.NEXT_PUBLIC_DISQUS_SHORTNAME,
      },
    },
  }
  
  module.exports = siteMetadata
  