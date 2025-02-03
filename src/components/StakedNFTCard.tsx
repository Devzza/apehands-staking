import { MediaRenderer, TransactionButton, useReadContract,  } from "thirdweb/react";
import { getNFT } from "thirdweb/extensions/erc721";
import { client } from "@/app/client";
import { prepareContractCall } from "thirdweb";
import { NFT_CONTRACT, STAKING_CONTRACT } from "../../utils/contracts";


type StakedNFTCardProps = {
    tokenId: bigint;
    refetchStakedInfo: () => void;
    refetchOwnedNFTs: () => void;
};

export const StakedNFTCard: React.FC<StakedNFTCardProps> = ({ tokenId, refetchStakedInfo, refetchOwnedNFTs }) => {
    const { data: nft, isLoading } = useReadContract(
        getNFT,
        {
            contract: NFT_CONTRACT,
            tokenId: tokenId,
        }
    );

    if (isLoading) {
        return <p>Cargando NFT...</p>; // Muestra un indicador de carga mientras se obtienen los datos
    }

    if (!nft) {
        return <p>No se pudo cargar la información del NFT.</p>; // Manejo de casos en los que `nft` no existe
    }

    return (
        <div className="flex flex-col items-center justify-items-center justify-center">
            <MediaRenderer
                client={client}
                src={nft.metadata.image}
                className="shadow-[5px_5px_0px_0px_rgba(53,35,65)] border-4 border-solid border-[#352341]"
                style={{
                    borderRadius: "15px",
                    width: "200px",
                    height: "200px",
                    marginBottom: "20px",
                }}
            />
            
            <p className="text-lg font-bold">{nft.metadata.name}</p>
            
            <div
             className="w-full h-24 bg-no-repeat bg-contain bg-center flex items-center justify-center font-lexend font-bold text-white text-lg"
                style={{backgroundImage:"url('/buttonmint.svg", width:"auto" }}>
                <TransactionButton
                    transaction={() =>
                        prepareContractCall({
                            contract: STAKING_CONTRACT,
                            method: "withdraw",
                            params: [[tokenId]],
                        })
                    }
                    onTransactionConfirmed={() => {
                        refetchOwnedNFTs();
                        refetchStakedInfo();
                        alert("Withdrawn!");
                    }}
                    className="!bg-transparent !text-white font-bold"
                    style={{
                        border: "none",
                        padding: "10px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        width: "100%",
                        fontSize: "14px",
                    }}
                >
                    Stop & get paid
                </TransactionButton>
            </div>
        </div>
    );
};
