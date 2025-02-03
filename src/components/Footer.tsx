import Link from "next/link";
import Image from "next/image";



export default function Footer() {
    return (
        <div className="row-start-2 flex justify-between items-center w-full px-6 py-16">
            <div className="bg-black text-white row-start-3 flex gap-6 font-lexend font-medium py-4 px-8 justify-between items-center rounded-xl">
                            <a
                  href="https://discord.gg/2YEfWm4dXR"
                  target="_blank"
                  rel="noopener noreferrer"
              >
                  <Image
                      aria-hidden
                      src="/discord.svg"
                      alt="discord logo"
                      width={16}
                      height={16} />
              </a>
              <a
                  href="https://x.com/boredonchain"
                  target="_blank"
                  rel="noopener noreferrer"
              >
                  <Image
                      aria-hidden
                      src="/x-logo.svg"
                      alt="x logo"
                      width={16}
                      height={16} />
              </a>
              <a
                  href="https://boredonchain.com"
                  target="_blank"
                  rel="noopener noreferrer"
              >
                  
                  boredonchain.com
              </a>
            </div>
            <div>
            <Image
          src="/boredlogo-black.png"
          alt="BoredOnChain logo"
          width={100}
          height={100}
          priority
        />
            </div>
        </div>

        

    )
}