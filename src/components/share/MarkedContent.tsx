import Image from 'next/image';
import Link from "next/link";
import React from "react";
import ReactMarkdown from "react-markdown";

const config = {
    img: ({ node, ...props }: any) => {
      return <Image src={props.src} alt={props.alt} width={500} height={500} />;
    },
    a: ({ node, href, onClick, children, ...props}: any) => {
        return <Link href={href} {...props}>{children}</Link>
    }
};

interface MarkedContentProps {
    children: any
}

const MarkedContent = ({ children } : MarkedContentProps) => {

    return (
        <>
            <div className="prose">
                <ReactMarkdown components={config}>
                    {children}
                </ReactMarkdown>
            </div>
        </>
    )
}

export default MarkedContent;
{/* <div className="prose contents" dangerouslySetInnerHTML={{ __html: marked(content) }} /> */}