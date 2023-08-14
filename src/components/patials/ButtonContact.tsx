import Image from "next/image";
import { styled } from "styled-components";

const ButtonOverCircleStyle = styled.div`
    top: 12px;
    left: 12px;
    width: 65px;
    height: 65px;
    border-radius: 100%;
    background-color: red;
    position: absolute;
    animation: zoom 1.3s infinite;

    @keyframes zoom {
        0% {
            transform: scale(.9);
        }

        70% {
            transform: scale(1);
            box-shadow: 0 0 0 15px transparent;
        }
        100% {
            transform: scale(.9);
            box-shadow: 0 0 0 0 transparent;
        }
    }
`
const ButtonCircleFillStyle = styled.div`
    
    animation: phone-vr-circle-fill 1s infinite ease-in-out;

    @keyframes phone-vr-circle-fill {
    0% {
        -webkit-transform: rotate(0) scale(1) skew(1deg)
    }

    10% {
        -webkit-transform: rotate(-25deg) scale(1) skew(1deg)
    }

    20% {
        -webkit-transform: rotate(25deg) scale(1) skew(1deg)
    }

    30% {
        -webkit-transform: rotate(-25deg) scale(1) skew(1deg)
    }

    40% {
        -webkit-transform: rotate(25deg) scale(1) skew(1deg)
    }

    50% {
        -webkit-transform: rotate(0) scale(1) skew(1deg)
    }

    100% {
        -webkit-transform: rotate(0) scale(1) skew(1deg)
    }
}
`

const ButtonContact = () => {

    return (
        <div className="fixed left-10 bottom-10">
            <div className="">
                <ButtonOverCircleStyle />
                <ButtonCircleFillStyle className="bg-blue-600 cursor-pointer p-1 rounded-full">
                    <Image
                        width={25}
                        height={25}
                        alt="image zalo"
                        src="/static/images/icon-zalo.png"
                        className="w-6 h-6 block"
                    />
                </ButtonCircleFillStyle>
            </div>
        </div>
    )
}

export default ButtonContact;