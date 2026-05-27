import Image from 'next/image';
import background from '@/app/assests/img/auth_bg_desktop.png';
import logo from '@/app/assests/img/logo.png';
import backgroundarrown from '@/app/assests/img/background-arrow.png';

export default function AuthBanner() {
    return (
        <div className="hidden lg:relative lg:flex w-[380px] overflow-hidden flex-shrink-0">
            <Image src={background} alt="background" fill className="object-cover" priority />

            <div className="relative z-10 flex flex-col justify-center px-10">
                <div className="mb-8">
                    <Image src={logo} alt="TopCV" height={100} />
                </div>
                <h2 className="text-white text-3xl font-bold leading-tight mb-4">
                    Tiếp lợi thế,
                    <br />
                    Nối thành công
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                    TopCV - Hệ sinh thái nhân sự tiên phong ứng
                    <br />
                    dụng công nghệ tại Việt Nam
                </p>
            </div>

            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                <Image src={backgroundarrown} alt="arrow" width={240} height={240} className="object-contain" />
            </div>
        </div>
    );
}
