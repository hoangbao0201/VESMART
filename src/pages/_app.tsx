import '@/styles/globals.css'
import '@/styles/feature.scss'
import { NextPage } from 'next';
import { Router } from 'next/router';
import type { AppProps } from 'next/app'
import { ReactElement, ReactNode } from 'react';

import "nprogress/nprogress.css";
import NProgress from "nprogress";

import ScrollOnTop from '@/components/share/ScrollOnTop';
import ButtonContact from '@/components/patials/ButtonContact';

//Binding events.
Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());
NProgress.configure({ showSpinner: false });

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function App({ Component, pageProps: { session, ...pageProps } }: AppPropsWithLayout) {

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page: ReactNode) => page)

  return (
    <>
      {getLayout(<Component {...pageProps} />)}
      
      <ScrollOnTop />

      {/* <ButtonContact /> */}
    </>
  )
}
