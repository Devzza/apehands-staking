'use client'

import { client } from "../client";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { ConnectButton, ConnectEmbed, useActiveAccount } from "thirdweb/react";
import { chain } from "../chain";
import { Staking } from "@/components/Staking";
import { createWallet } from "thirdweb/wallets";

export default function Stake() {
  const wallets = [
          createWallet("io.metamask"),
          createWallet("com.coinbase.wallet"),
          createWallet("me.rainbow"),
          createWallet("io.rabby"),
          createWallet("app.phantom"),
        ];

  const account = useActiveAccount();
return (
    <>  
    <div
        style={{width:"100%"}}
        className="h-full bg-gradient-to-br from-blue-600 via-blue-400 to-white">
        
        <NavBar />

        <div className="flex flex-col items-center font-lexend pt-7"></div>
        <div>
          {/* Si el usuario NO está conectado, muestra ConnectEmbed */}
          {!account && (
                        <div className="flex flex-col justify-center items-center mt-36 mb-36">
                          <div className="mb-7">
                          <h2 className="font-bold">Connect your wallet!</h2>
                          </div>
                          <div>
                            <ConnectButton
                                              client={client}
                                              chain={chain}
                                              wallets={wallets}
                                              connectModal={{
                                                  size: "wide",
                                                  showThirdwebBranding: false,
                                              }} />
                                              </div>
                        </div>
                    )}

           {/* Si el usuario está conectado, muestra Staking */}
           {account && <Staking />}
        </div>
        <Footer/>
      </div>

    </>
    )
}