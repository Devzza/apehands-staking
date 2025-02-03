import Image from "next/image";

export default function Home() {
  return (
    <><section>
      <div className="bg-[url('/boredonchain-bg.jpg')] w-full h-screen lg:h-full p-12 lg:p-24 bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center justify-items-center">

        <div className="bg-[url('/divhome.svg')] w-full h-[450px] relative flex flex-col items-center justify-center justify-items-center bg-no-repeat bg-contain bg-center">

          <Image
            aria-hidden
            src="/bananotkn.svg"
            alt="Banano Token logo"
            width={50}
            height={50} />

          <Image
            style={{
              marginBottom: "20px",
              marginTop: "10px"
            }}
            src="/apehandslogo.svg"
            alt="Ape Hands logo"
            width={250}
            height={250}
            priority />



          <div className="mb-3 w-full h-12 bg-no-repeat bg-contain bg-center flex items-center justify-center font-lexend font-bold text-white text-lg"
            style={{ backgroundImage: "url('/buttonmint.svg')", width: "auto" }}>
            <a href="/mint"><button

              className="!bg-transparent !text-white font-bold w-full px-8 py-2 mb-2"
              style={{
                fontSize: "16px",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontFamily: "Lexend",
              }}
            >Mint</button></a>
          </div>

          <div className="w-full h-12 bg-no-repeat bg-contain bg-center flex items-center justify-center font-lexend font-bold text-white text-lg"
          style={{ backgroundImage: "url('/buttonmint.svg')", width: "auto" }}>              
          <a href="/stake"><button

            className="!bg-transparent !text-white font-bold w-full px-8 py-2 mb-2"
            style={{
              fontSize: "16px",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontFamily: "Lexend",
            }}
          >Stake</button></a>
      </div>

            

      <div className=" flex gap-4 py-4 px-8 justify-between items-center mt-5">
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
      </div>

    </div><div>
        <a href="https://boredonchain.com">  <Image
          src="/boredlogo-black.png"
          alt="BoredOnChain logo"
          width={100}
          height={100}
          priority /></a>
      </div>

      </div>

    </section></>
    
  )
}
