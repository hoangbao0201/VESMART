import Link from "next/link";


const Footer = () => {

    return (
        <footer className="bg-gray-600">
            <div className="w-full py-4">
                <div className="md:flex lg:max-w-7xl max-w-3xl w-full mx-auto px-4">
                    <div className="pb-4 md:w-4/12 max-md:border-b ">
                        <h1 className="mb-3 text-2xl font-bold text-white">
                            <Link title="Truyện tranh online" href={`/`}>VESMART</Link>
                        </h1>
                        <p className="text-white">
                            <Link href={`/chinh-sach-bao-mat`}>
                                Chính sách bảo mật
                            </Link>
                        </p>
                        <p className="text-white">
                            <Link href={`/chinh-sach-bao-mat`}>
                                Liên hệ:
                            </Link>
                        </p>
                    </div>

                    <div className="pb-8 md:w-8/12">
                        <h4 className="my-2 text-white font-semibold text-lg">Từ khóa</h4>
                        <ul className="flex flex-wrap gap-2 text-sm whitespace-nowrap text-white [&>li]:p-1 [&>li]:border [&>li]:rounded-sm [&>li]:border-white/80">
                            <li><Link target="_self" href="/">Sữa chữa robot hút bụi Đà Nẵng</Link></li>
                            <li><Link target="_self" href="/">Sữa chữa robot hút bụi</Link></li>
                            <li><Link target="_self" href="/">Sữa chữa robot hút bụi uy tín</Link></li>
                            <li><Link target="_self" href="/">Sữa chữa Đà Nẵng</Link></li>
                            <li><Link target="_self" href="/">Sữa chữa</Link></li>
                            <li><Link target="_self" href="/">Sữa chữa robot uy tín ở Đà Nẵng</Link></li>
                            <li><Link target="_self" href="/">Đà Nẵng</Link></li>
                            <li><Link target="_self" href="/">Thiết bị Đà Nẵng</Link></li>
                            <li><Link target="_self" href="/">Linh kiện Đà Nẵng</Link></li>
                            <li><Link target="_self" href="/">Robot hút bụi</Link></li>
                            <li><Link target="_self" href="/">Robot hút bụi Đà Nẵng</Link></li>
                            <li><Link target="_self" href="/">Robot hút bụi Đà Nẵng uy tín</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer;