'use client'

import { useEffect, useState } from "react";
import { NFT } from "thirdweb";
import { getNFTs, ownerOf, totalSupply } from "thirdweb/extensions/erc721";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { NFT_CONTRACT, STAKING_CONTRACT } from "../../utils/contracts";
import Link from "next/link";
import { StakeRewards } from "./StakeRewards";
import { NFTCard } from "./NFTCard";
import { StakedNFTCard } from "./StakedNFTCard";

export const Staking = () => {
    const account = useActiveAccount();

    const [ownedNFTs, setOwnedNFTs] = useState<NFT[]>([]);

    const getOwnedNFTs = async () => {
        let ownedNFTs: NFT[] = [];
        
        const totalNFTSupply = await totalSupply({
            contract: NFT_CONTRACT
        });

        const nfts = await getNFTs({
            contract: NFT_CONTRACT,
            start: 0,
            count: parseInt(totalNFTSupply.toString())
        });
    
        for(let nft of nfts){
            const owner = await ownerOf ({
                contract: NFT_CONTRACT,
                tokenId: nft.id
            });
            if(owner === account?.address){
                ownedNFTs.push(nft);
            }
        }
        setOwnedNFTs(ownedNFTs);
    };

    useEffect(() => {
        if(account){
            getOwnedNFTs();
        }
    }, [account]);
   
    const {
        data: stakedInfo,
        refetch: refetchStakedInfo
    } = useReadContract({
        contract: STAKING_CONTRACT,
        method: "getStakeInfo",
        params: [account?.address || ""]
    });


    if(account){
    return(
        <>
        <div className="flex flex-col lg:flex-row mx-12 lg:mx-40">
        {/* ^^^ div mintcard + rewards card ^^^*/}

           {/*div mint*/}
           <div
      className=" bg-url(/mintapehand.svg) w-auto lg:w-1/2 h-[450px]  relative flex flex-col items-center justify-center justify-items-center bg-no-repeat bg-contain bg-center"
      style={{
        backgroundImage: "url('/mintapehand.svg')",
      }}
    >           {/*<div className="flex flex-col w-full lg:w-1/2 bg-gradient-to-br from-[#f7ba7d] to-[#f4a555] shadow-[5px_5px_0px_0px_rgba(0,0,0)] border-2 border-solid border-black rounded-lg text-black items-center justify-items-center p-24 lg:mr-4 mb-7  ">*/}
           <h1 className="font-lexend text-2xl text-white font-bold text-center ">Mint an Ape Hand</h1>
           <h1 className="font-lexend text-2xl text-white font-bold text-center mb-7">to start a Show</h1>
           
           <div className="w-1/2 h-24 bg-no-repeat bg-contain bg-center flex items-center justify-center font-lexend font-bold text-white text-lg"
                style={{backgroundImage:"url('/buttonmint.svg", width:"auto" }}>
           <Link href={"/mint"} className="p-12 mb-2">Mint</Link>
            </div>
        
           </div>

           {/*div rewards card*/}

<div
      className="bg-url(/divearnings.svg) w-auto lg:w-1/2 h-[450px] lg:h-[500px] relative flex flex-col items-center justify-center justify-items-center bg-no-repeat bg-contain bg-center"
      style={{
        backgroundImage: "url('/divearnings.svg')",
      }}
    >
      {/* Contenido de la carta */}
      <StakeRewards />
    </div>
        </div>

    {/*backstage*/}
      <div className="mt-7 mx-12 lg:mx-40">
      
      {/*estilos div + title*/}
      
      <div className="bg-white font-lexend text-black w-full h-auto shadow-[5px_5px_0px_0px_rgba(53,35,65)] border-4 border-solid border-[#352341] rounded-lg text-black p-16 lg:p-24 mb-7 relative flex flex-col  bg-no-repeat bg-cover bg-center">

      {/*className="bg-url(/bgstage.svg) font-lexend text-white w-full h-auto shadow-[5px_5px_0px_0px_rgba(53,35,65)] border-4 border-solid border-[#352341] rounded-lg text-black p-16 lg:p-24 mb-7 relative flex flex-col  bg-no-repeat bg-cover bg-center"      
      style={{
        backgroundImage: "url('/bgstage.svg')",}}>*/}
      <h2 className="mb-4 text-2xl font-bold">Backstage</h2>
      <p className="mb-7">Here are your Apes waiting to jump on Main Stage.</p>
      
      {/*owned NFTs*/}

      <div className="flex flex-col md:flex-row lg:flex-row flex-wrap gap-5 items-center md:items-left lg:items-left justify-items-center md:justify-items-left lg:justify-items-left justify-center md:justify-start lg:justify-start">
      {ownedNFTs && ownedNFTs.length> 0 ? (
                        ownedNFTs.map((nft) => (
                            <NFTCard
                                key={nft.id}
                                nft={nft}
                                refetchOwnedNFTs={getOwnedNFTs}
                                refetchStakedInfo={refetchStakedInfo}
                            />
                        ))

                    ) : (
                        <p> You don't have any Ape Hand. </p>
                    )}
            </div>
        </div>
      </div>

    {/*main stage*/}

    <div className="mt-7 mx-12 lg:mx-40">

        {/*estilos div + title*/}
      
        <div className="bg-white font-lexend text-black w-full h-auto shadow-[5px_5px_0px_0px_rgba(53,35,65)] border-4 border-solid border-[#352341] rounded-lg text-black p-16 lg:p-24 mb-7 relative flex flex-col  bg-no-repeat bg-cover bg-center">

            <h2 className="mb-4 text-2xl font-bold">Main Stage</h2>
            <p className="mb-7">Ape Hands in a Show earning $BANANOs.</p>

            <div className="flex flex-col md:flex-row lg:flex-row flex-wrap gap-5 items-center md:items-left lg:items-left justify-items-center md:justify-items-left lg:justify-items-left justify-center md:justify-start lg:justify-start">
        {stakedInfo && stakedInfo[0].length > 0 ? (
                            stakedInfo[0].map((tokenId: bigint) => (
                                <StakedNFTCard
                                key={tokenId}
                                tokenId={tokenId}  
                                refetchOwnedNFTs={getOwnedNFTs}
                                refetchStakedInfo={refetchStakedInfo}                              
                                />
                            ))
                        ) : (
                            <p>You have 0 Ape hands on Main Stage</p>
                        )}
        </div>
        </div>

        

    </div>

    </>
    )
}
}