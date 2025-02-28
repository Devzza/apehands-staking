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
    const [isLoading, setIsLoading] = useState(false); // Estado de carga

    const getOwnedNFTs = async () => {
        setIsLoading(true); // Activar loading antes de la consulta
        let ownedNFTs: NFT[] = [];
        
        try {
            const totalNFTSupply = await totalSupply({ contract: NFT_CONTRACT });

            const nfts = await getNFTs({
                contract: NFT_CONTRACT,
                start: 0,
                count: parseInt(totalNFTSupply.toString()),
            });

            for (let nft of nfts) {
                const owner = await ownerOf({
                    contract: NFT_CONTRACT,
                    tokenId: nft.id,
                });
                if (owner === account?.address) {
                    ownedNFTs.push(nft);
                }
            }

            setOwnedNFTs(ownedNFTs);
        } catch (error) {
            console.error("Error fetching NFTs:", error);
        }

        setIsLoading(false); // Desactivar loading después de la consulta
    };

    useEffect(() => {
        if (account) {
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

    if (account) {
        return (
            <>
                <div className="flex flex-col lg:flex-row mx-12 lg:mx-40">
                    {/* Mint Section */}
                    <div
                        className=" bg-url(/mintapehand.svg) w-auto lg:w-1/2 h-[450px] relative flex flex-col items-center justify-center bg-no-repeat bg-contain bg-center"
                        style={{ backgroundImage: "url('/mintapehand.svg')" }}
                    >
                        <h1 className="font-lexend text-2xl text-white font-bold text-center">Mint an Ape Hand</h1>
                        <h1 className="font-lexend text-2xl text-white font-bold text-center mb-7">to start a Show</h1>
                        
                        <div className="w-1/2 h-24 bg-no-repeat bg-contain bg-center flex items-center justify-center font-lexend font-bold text-white text-lg"
                            style={{ backgroundImage: "url('/buttonmint.svg')" }}>
                            <Link href={"/mint"} className="p-12 mb-2">Mint</Link>
                        </div>
                    </div>

                    {/* Rewards Card */}
                    <div
                        className="bg-url(/divearnings.svg) w-auto lg:w-1/2 h-[450px] lg:h-[500px] relative flex flex-col items-center justify-center bg-no-repeat bg-contain bg-center"
                        style={{ backgroundImage: "url('/divearnings.svg')" }}
                    >
                        <StakeRewards />
                    </div>
                </div>

                {/* Backstage Section */}
                <div className="mt-7 mx-12 lg:mx-40">
                    <div className="bg-white font-lexend text-black w-full h-auto shadow-[5px_5px_0px_0px_rgba(53,35,65)] border-4 border-solid border-[#352341] rounded-lg text-black p-16 lg:p-24 mb-7 flex flex-col">
                        <h2 className="mb-4 text-2xl font-bold">Backstage</h2>
                        <p className="mb-7">Here are your Apes waiting to jump on Main Stage.</p>

                        {/* Owned NFTs Section */}
                        <div className="flex flex-col md:flex-row lg:flex-row flex-wrap gap-5 items-center justify-center md:justify-start">
                            {isLoading ? (
                                <p className="text-gray-500 font-bold animate-pulse">Loading NFTs...</p> // Loader animado
                            ) : ownedNFTs.length > 0 ? (
                                ownedNFTs.map((nft) => (
                                    <NFTCard
                                        key={nft.id}
                                        nft={nft}
                                        refetchOwnedNFTs={getOwnedNFTs}
                                        refetchStakedInfo={refetchStakedInfo}
                                    />
                                ))
                            ) : (
                                <p>You don't have any Ape Hand.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Stage Section */}
                <div className="mt-7 mx-12 lg:mx-40">
                    <div className="bg-white font-lexend text-black w-full h-auto shadow-[5px_5px_0px_0px_rgba(53,35,65)] border-4 border-solid border-[#352341] rounded-lg text-black p-16 lg:p-24 mb-7 flex flex-col">
                        <h2 className="mb-4 text-2xl font-bold">Main Stage</h2>
                        <p className="mb-7">Ape Hands in a Show earning $BANANOs.</p>

                        <div className="flex flex-col md:flex-row lg:flex-row flex-wrap gap-5 items-center justify-center md:justify-start">
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
                                <p>You have 0 Ape Hands on Main Stage</p>
                            )}
                        </div>
                    </div>
                </div>
            </>
        );
    }
};
