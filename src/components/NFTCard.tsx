import { client } from "@/app/client";
import { useState } from "react";
import { NFT, prepareContractCall } from "thirdweb"
import { MediaRenderer, TransactionButton } from "thirdweb/react";
import { approve } from "thirdweb/extensions/erc721";
import { IoClose } from "react-icons/io5";
import styles from "@/app/page.module.css";
import Link from "next/link";
import { NFT_CONTRACT, STAKING_CONTRACT } from "../../utils/contracts";
import { FaRegCircle, FaRegCircleCheck } from "react-icons/fa6";



type OwnedNFTsProps = {
    nft: NFT;
    refetchOwnedNFTs: () => void;
    refetchStakedInfo: () => void;
    isApprovedForAll: boolean;  
    isSelected: boolean;
    toggleSelectNFT: (id: number) => void;
};

export const NFTCard = ({ nft, refetchOwnedNFTs, refetchStakedInfo, isApprovedForAll, isSelected, toggleSelectNFT }: OwnedNFTsProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isApproved, setIsApproved] = useState(false);

    return (
        <div className="flex flex-col items-center justify-items-center justify-center">
<div 
        onClick={() => toggleSelectNFT(nft.id)} 
        className="cursor-pointer relative"
    >
        {/* Icono de selección en la esquina superior derecha */}
        <div className="absolute top-2 right-2 text-white text-2xl z-10">
            {isSelected ? <FaRegCircleCheck className="text-green-500" /> : <FaRegCircle className="text-white/80" />}
        </div>

        {/* Imagen del NFT */}
        <MediaRenderer
            client={client}
            src={nft.metadata.image}
            className="shadow-[5px_5px_0px_0px_rgba(53,35,65)]"
            style={{
                borderRadius: "15px",
                width: "200px",
                height: "200px",
                marginBottom: "20px"
            }}
        />
    </div>

            
            <p className=" text-lg font-bold">{nft.metadata.name}</p>

                
            <div className="w-full h-24 bg-no-repeat bg-contain bg-center flex items-center justify-center font-lexend font-bold text-white text-lg"
                style={{backgroundImage:"url('/buttonmint.svg", width:"auto" }}>
           
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="!bg-transparent !text-white font-bold w-full px-10 py-4 mb-2"
                    style={{
                        fontSize: "16px",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontFamily: "Lexend",
                    }}
                >Start a show</button>
            </div>

{isModalOpen && (
            <div className="z-50"
            style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                
                <div style={{
                        minWidth: "300px",
                        backgroundColor: "#000",
                        padding: "20px",
                        borderRadius: "10px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    }}>
                    
                    <div style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            width: "100%"
                        }}>
                            
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{
                                    border: "none",
                                    backgroundColor: "transparent",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontSize: "24px"
                                }}
                            ><IoClose /></button>
                    </div>
                    
                    <h3 style={{ margin: "10px 0", color: "#fff"}}>You are about to stake: </h3>
                        <MediaRenderer
                        client={client}
                        src={nft.metadata.image}
                        style={{
                            borderRadius: "10px",
                            marginBottom: "10px"
                        }}
                        />
                        {!isApproved && !isApprovedForAll ? (
                            <TransactionButton
                            transaction={() => (
                                approve({
                                    contract: NFT_CONTRACT,
                                    to: STAKING_CONTRACT.address,
                                    tokenId: nft.id
                                })
                            )}
                            style={{
                                width: "100%"
                            }}
                            onTransactionConfirmed={() => setIsApproved(true)}

                            >Approve</TransactionButton>
                        ) : (
                            <TransactionButton
                            transaction={() => (
                                prepareContractCall({
                                    contract: STAKING_CONTRACT,
                                    method: "stake",
                                    params: [[nft.id]]
                                })
                            )}
                            onTransactionConfirmed={() => {
                                alert("Staked!");
                                setIsModalOpen(false);
                                refetchOwnedNFTs();
                                refetchStakedInfo();
                            }}
                            style={{
                                width: "100%"
                            }}
                            >Stake</TransactionButton>
                        )}
                </div>


            </div>
                
                
                
                    )}

</div>
    )
}