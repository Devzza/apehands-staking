'use client'

import { defineChain, getContract, toEther } from "thirdweb";
{/*define chain*/}
import { client } from "../client";
import { MediaRenderer, TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { getContractMetadata } from "thirdweb/extensions/common";
import { claimTo, getActiveClaimCondition, getTotalClaimedSupply, nextTokenIdToMint } from "thirdweb/extensions/erc721";
import { useState } from "react";
import NavBar from "@/components/NavBar";
import { FaCircleMinus, FaCirclePlus } from "react-icons/fa6";
import Footer from "@/components/Footer";
import Image from "next/image";
import { NFT_CONTRACT } from "../../../utils/contracts";
import { apechain } from "../apechain";


export default function Claim() {
    const chain = defineChain( apechain );
    const account = useActiveAccount();

    const [quantity, setQuantity] = useState(1);

    {/*define contract address*/}

    const contract = getContract({
        client: client,
        chain: chain,
        address: NFT_CONTRACT.address,
    });

    const { data: contractMetadata, isLoading: isContractMetadataLoading } = useReadContract( getContractMetadata,
        { contract: contract}
    );

    const { data: claimedSupply, isLoading: isClaimSupplyLoading } = useReadContract( getTotalClaimedSupply,
        { contract: contract}
    );

    const { data: totalNFTSupply, isLoading: isTotalSupplyLoading } = useReadContract( nextTokenIdToMint,
        { contract: contract}
    );

    const { data: claimCondition} = useReadContract( getActiveClaimCondition,
        { contract: contract}
    );

    const getPrice = (quantity: number) => {
        const total = quantity * parseInt(claimCondition?.pricePerToken.toString() || "0");
        return toEther(BigInt(total));
    }

    return (
    <>  
    <div
        className="bg-gradient-to-br from-blue-600 via-blue-400 to-white w-full h-full">
        
        <NavBar />

        <div className="flex flex-col items-center font-lexend pt-5">
        <div
      className=" w-full lg:w-1/2 h-[550px] relative flex flex-col items-center justify-center justify-items-center bg-no-repeat bg-contain bg-center"
      style={{
        backgroundImage: "url('/divmint.svg')",
      }}
    >
            {/*<div className="flex flex-col shadow-[5px_5px_0px_0px_rgba(0,0,0)] bg-white text-black items-center justify-items-center p-12 w-2/3 md:w-2/5 lg:w-1/3 border-2 border-solid border-black rounded-lg	">*/}
            {isContractMetadataLoading ? (
            <p>Loading...</p>
        ) : (
            <>
            <MediaRenderer
            client={client}
            src={contractMetadata?.image}
            className="shadow-[5px_5px_0px_0px_rgba(0,0,0)]"
            style={{borderRadius: "15px", border:"3px solid black ", width: "150px", height: "150px", marginBottom: "20px"}}
            />

            </>
        )}    

{isClaimSupplyLoading || isTotalSupplyLoading ? (
            <p>Loading...</p>
        ) : (
            <>
            <h2 className="mb-3 font-titan text-white text-4xl uppercase">
                                    {contractMetadata?.name}
                                </h2><p style={{ marginBottom: "20px", paddingLeft:"", paddingRight:"" }}>
                                        {/* {contractMetadata?.description} */}
                                    </p></>
        )}

        <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",

        }}>
            <Image
                aria-hidden
                src="/minusbutton.svg"
                alt="Minus button"
                className="cursor-pointer mr-2.5"
                width={30}
                height={30}
                onClick={() => setQuantity(Math.max(1, quantity - 1))} />


            
            <input type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            style={{width: "50px",
                textAlign: "center",
                borderRadius: "2px",
                backgroundColor: "#e1e1e1",
                color: "#000",
                paddingTop: "5px",
                paddingBottom: "5px"}}
            />
            
            <Image
                aria-hidden
                src="/plusbutton.svg"
                alt="Plus button"
                className="cursor-pointer ml-2.5"
                width={30}
                height={30}
                onClick={() => setQuantity(Math.max(1, quantity + 1))} />

            

                

        </div>
<div className="mt-4 pb-2 w-full h-16 bg-no-repeat bg-contain bg-center flex items-center justify-center "
style={{backgroundImage:"url('/mintbutton.svg" }}>
        <TransactionButton
        
            transaction={() => claimTo({
                contract: contract,
                to: account?.address || "",
                quantity: BigInt(quantity),
            })}
            onTransactionConfirmed={async () => {
                alert("NFT minted");
                setQuantity(1);
            }}
            className="!bg-transparent !text-white !font-bold !uppercase ">
        {`Mint (${getPrice(quantity)} APE)`}
        </TransactionButton>
        </div>

        <p style={{ marginTop: "10px", fontSize:"16px" }}>
                                        Minted: {claimedSupply?.toString()}/{totalNFTSupply?.toString()}
                                    </p>
            </div>

        </div>
        <Footer />
    </div>
        </>
    )
}