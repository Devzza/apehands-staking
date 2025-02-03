'use client'

import { client } from "../client";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { ConnectEmbed } from "thirdweb/react";
import { chain } from "../chain";
import { Staking } from "@/components/Staking";

export default function Stake() {
return (
    <>  
    <div
        style={{width:"100%"}}
        className="h-full bg-gradient-to-br from-blue-600 via-blue-400 to-white">
        
        <NavBar />

        <div className="flex flex-col items-center font-lexend pt-7"></div>
        <div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ConnectEmbed
              client={client}
              chain={chain}
               />
          </div>
          <Staking />
        </div>
        <Footer/>
      </div>

    </>
    )
}