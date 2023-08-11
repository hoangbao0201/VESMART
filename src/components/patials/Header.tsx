import Link from "next/link";


const Header = () => {

    return (
        <header className="bg-white border-b">
            <div className="w-full h-[50px]">
                <div className="flex lg:max-w-7xl max-w-3xl w-full mx-auto px-4">

                    <Link title="VESMART" href={`/`}>
                        <p className="leading-[50px] text-2xl font-bold">
                            VESMART
                        </p>
                    </Link>

                    {/* <div className="ml-auto flex items-center">
                        <div className="text-white">
                            <Link href={`/auth/login`} className="p-1">Đăng nhập</Link>
                            {" / "}
                            <Link href={`/auth/register`} className="p-1">Đăng kí</Link>
                        </div>
                    </div> */}
                    
                </div>
            </div>
        </header>
    )
}

export default Header;