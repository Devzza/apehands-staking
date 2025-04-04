'use client'

import { useEffect, useState } from "react";
import { NFT, prepareContractCall } from "thirdweb";
import { getNFTs, ownerOf, totalSupply, getOwnedNFTs, balanceOf } from "thirdweb/extensions/erc721";
import { useActiveAccount, useReadContract, useSendTransaction, TransactionButton } from "thirdweb/react";
import { NFT_CONTRACT, STAKING_CONTRACT } from "../../utils/contracts";
import Link from "next/link";
import { StakeRewards } from "./StakeRewards";
import { NFTCard } from "./NFTCard";
import { StakedNFTCard } from "./StakedNFTCard";
import { IoIosInformationCircleOutline } from "react-icons/io";


export const Staking = () => {
    const account = useActiveAccount();

    const [ownedNFTs, setOwnedNFTs] = useState<NFT[]>([]);
    const [isLoading, setIsLoading] = useState(false); 
    
    const getOwnedNFTs = async () => {
        setIsLoading(true);
        let ownedNFTs: NFT[] = [];
    
        try {
            const totalNFTSupply = await totalSupply({ contract: NFT_CONTRACT });
            const totalSupplyBigInt = BigInt(totalNFTSupply.toString());
    
            console.log("Total supply:", totalSupplyBigInt.toString());
    
            const ownerPromises = [];
            for (let tokenId = BigInt(0); tokenId < totalSupplyBigInt; tokenId++) {
                ownerPromises.push(
                    ownerOf({
                        contract: NFT_CONTRACT,
                        tokenId: tokenId,
                    }).then((owner) => {
                        console.log(`Token ID ${tokenId} - Owner: ${owner}`);
                        return { tokenId, owner };
                    })
                    .catch((error) => {
                        console.error(`Error fetching owner for token ${tokenId}:`, error);
                        return null;
                    })
                );
            }
    
            const owners = await Promise.all(ownerPromises);
    
            console.log("Account address:", account?.address);
            
            // Filtrar los tokenIds que pertenecen al usuario
            const ownedTokenIds = owners
                .filter((result) => result && result.owner.toLowerCase() === account?.address?.toLowerCase()) 
                .map((result) => Number(result!.tokenId));
    
            console.log("Owned token IDs:", ownedTokenIds);
    
            if (ownedTokenIds.length === 0) {
                console.warn("⚠️ No NFTs found for this account.");
                setOwnedNFTs([]);
                setIsLoading(false);
                return;
            }
    
            // Obtener metadata de los NFTs
            const metadataPromises = ownedTokenIds.map((tokenId) =>
                getNFTs({
                    contract: NFT_CONTRACT,
                    start: tokenId,
                    count: 1,
                }).then((nfts) => {
                    console.log(`Metadata for Token ID ${tokenId}:`, nfts);
                    return nfts[0];
                })
                .catch((error) => {
                    console.error(`Error fetching metadata for token ${tokenId}:`, error);
                    return null;
                })
            );
    
            const metadataResults = await Promise.all(metadataPromises);
            ownedNFTs = metadataResults.filter((nft) => nft !== null);
    
            console.log("Final Owned NFTs:", ownedNFTs);
    
            setOwnedNFTs(ownedNFTs);
        } catch (error) {
            console.error("Error fetching NFTs:", error);
        }
    
        setIsLoading(false);
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

    const [selectedNFTs, setSelectedNFTs] = useState<bigint[]>([]); // Ahora guardamos los seleccionados como bigint

    const toggleSelectNFT = (tokenId: bigint) => {
        setSelectedNFTs((prev) =>
            prev.includes(tokenId)
                ? prev.filter((id) => id !== tokenId) // Si ya está seleccionado, lo quitamos
                : [...prev, tokenId] // Si no está seleccionado, lo añadimos
        );
    };
    


    // check if staking contract is approved
    const { data: isApprovedForAll, isPending: loadingIsApprovedForAll } = useReadContract({
        contract: NFT_CONTRACT,
        method:
          "function isApprovedForAll(address owner, address operator) view returns (bool)",
        params: [account?.address || "", STAKING_CONTRACT.address],
      });
    

      // approve staking contract to transfer nfts out
    const { mutate: sendTransaction } = useSendTransaction();

    const approveForAll = () => {
      const transaction = prepareContractCall({
        contract: NFT_CONTRACT,
        method:
          "function setApprovalForAll(address operator, bool approved)",
        params: [STAKING_CONTRACT.address, true],
      });
      sendTransaction(transaction);
    };

    // revoke approvalForAll
    const revokeForAll = () => {
        const transaction = prepareContractCall({
          contract: NFT_CONTRACT,
          method:
            "function setApprovalForAll(address operator, bool approved)",
          params: [STAKING_CONTRACT.address, false],
        });
        sendTransaction(transaction);
      };
      



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
                     

                        {ownedNFTs && ownedNFTs.length > 0 && !isApprovedForAll && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mb-4">
            <p className="font-bold text-lg"> <IoIosInformationCircleOutline /> </p>
            <p className="font-bold">You must approve your NFTs</p>
            <p>Please approve them before staking multiple NFTs in one transaction.</p>
            {/* Botón de Approve / Revoke */}
        <button
            onClick={isApprovedForAll ? revokeForAll : approveForAll}
            disabled={loadingIsApprovedForAll}
            className={`mt-[15px] text-white p-2 rounded-md ${isApprovedForAll ? 'bg-red-500' : 'bg-green-600'} ${
                loadingIsApprovedForAll ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
            {loadingIsApprovedForAll ? "Loading..." : isApprovedForAll ? "Revoke your approval" : "Approve your Ape Hands"}
        </button>
        </div>
    )}

{ownedNFTs && ownedNFTs.length > 0 && isApprovedForAll && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mb-4">
                        <p className="font-bold text-lg"> <IoIosInformationCircleOutline /> </p>
                        <p className="font-bold">Stay SAFU</p>
            <p>You can revoke your approval if you don't want to stake more NFTs. </p>
            {/* Botón de Approve / Revoke */}
        <button
            onClick={isApprovedForAll ? revokeForAll : approveForAll}
            disabled={loadingIsApprovedForAll}
            className={`mt-[15px] text-white p-2 rounded-md ${isApprovedForAll ? 'bg-red-500' : 'bg-green-600'} ${
                loadingIsApprovedForAll ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
            {loadingIsApprovedForAll ? "Loading..." : isApprovedForAll ? "Revoke your approval" : "Approve your Ape Hands"}
        </button>
        </div>
    )}


{ownedNFTs && ownedNFTs.length > 0 && isApprovedForAll && (
    <> 
        

        {/* Botón de Stake Selected */}
        {selectedNFTs.length > 0 && (
               <TransactionButton
               transaction={() => {
                   const tokenIds = selectedNFTs; 
                   return prepareContractCall({
                       contract: STAKING_CONTRACT,
                       method: "stake",
                       params: [tokenIds],
                   });
               }}
               onTransactionConfirmed={async () => {
                   alert("NFTs staked!");
                   await refetchStakedInfo();
                   await getOwnedNFTs();
                   setSelectedNFTs([]);
                   setOwnedNFTs(ownedNFTs.filter(nft => !selectedNFTs.includes(nft.id)));
               }}
               style={{
                   width: "100%",
                   backgroundColor: "#000000",
                   color: "white",
                   padding: "10px",
                   borderRadius: "8px",
                   marginBottom: "15px"
               }}
           >
               Stake selected NFTs ({selectedNFTs.length})
           </TransactionButton>
       )}
       
       {/* Botón de Stake All */}
       <TransactionButton
           transaction={() => {
               const tokenIds = ownedNFTs.map((nft) => BigInt(nft.id)); 
               return prepareContractCall({
                   contract: STAKING_CONTRACT,
                   method: "stake",
                   params: [tokenIds],
               });
           }}
           onTransactionConfirmed={() => {
               alert("All NFTs staked!");
               refetchStakedInfo();
               getOwnedNFTs();
           }}
           style={{
               width: "100%",
               backgroundColor: "#03a9f4",
               color: "white",
               padding: "10px",
               borderRadius: "8px",
               marginBottom: "15px"
           }}
       >
           Stake All
       </TransactionButton>
    </>
)}





                        {/* Owned NFTs Section */}
                        <div className="flex flex-col md:flex-row lg:flex-row flex-wrap gap-5 items-center justify-center md:justify-start">
                            {isLoading ? (
                                <p className="text-gray-500 font-bold animate-pulse">Loading NFTs... This may take a while.</p> // Loader animado
                            ) : ownedNFTs.length > 0 ? (
                                ownedNFTs.map((nft) => (
                                    <NFTCard
                                        key={nft.id}
                                        nft={nft}
                                        refetchOwnedNFTs={getOwnedNFTs}
                                        refetchStakedInfo={refetchStakedInfo}
                                        isApprovedForAll={isApprovedForAll}
                                        isSelected={selectedNFTs.includes(nft.id)}
                                        toggleSelectNFT={toggleSelectNFT}
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
  {/* Mostrar el botón de Unstake solo si hay NFTs en staking */}
  {stakedInfo && stakedInfo[0].length > 0 ? (
    <>
      <TransactionButton
    transaction={() =>
        prepareContractCall({
            contract: STAKING_CONTRACT,
            method: "withdraw",
            params: [stakedInfo[0]], 
        })
    }
    onTransactionConfirmed={() => {
        alert("Unstaked successfully!");
        refetchStakedInfo();
        getOwnedNFTs();
    }}
    style={{
        width: "100%",
        backgroundColor: "red",
        color: "white",
        padding: "10px",
        borderRadius: "8px",
    }}
>
    Unstake All
</TransactionButton>


      {/* Muestra las tarjetas de los NFTs en staking */}
      {stakedInfo[0].map((tokenId: bigint) => (
        <StakedNFTCard
          key={tokenId.toString()}
          tokenId={tokenId}
          refetchOwnedNFTs={getOwnedNFTs}
          refetchStakedInfo={refetchStakedInfo}
        />
      ))}
    </>
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