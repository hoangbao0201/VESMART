import { ReactNode } from "react";

import Header from "../patials/Header";
import Footer from "../patials/Footer";


interface MainLayoutProps {
    children: ReactNode
    isHeader?: boolean
    isFooter?: boolean
    isContact?: boolean
}

const MainLayout = ({ children, isHeader = true, isFooter = true, isContact = true }: MainLayoutProps) => {


    return (
        <main>

            { isHeader && <Header /> }

            <div className={``}>
                {children}
            </div>

            { isFooter && <Footer /> }

        </main>
    )
}

export default MainLayout;