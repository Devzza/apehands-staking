'use client'

import { defineChain, getContract, toEther } from "thirdweb";
import { client } from "../client";
import {
  MediaRenderer,
  TransactionButton,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { getContractMetadata } from "thirdweb/extensions/common";
import { claimTo, getActiveClaimCondition } from "thirdweb/extensions/erc1155";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { apechain } from "../apechain";
import { useState } from "react";
import Image from "next/image";


export default function Claim() {
  const chain = defineChain(apechain);
  const account = useActiveAccount();
  const tokenId = BigInt(0); // ID del token ERC1155 a mintear
  const [isMinting, setIsMinting] = useState(false);

  const contract = getContract({
    client: client,
    chain: chain,
    address: "0x68c34097448138e9214Bbb3861E8F435B36f8B90",
  });

  // Metadata general del contrato
  const { data: contractMetadata, isLoading: isContractMetadataLoading } =
    useReadContract(getContractMetadata, { contract });

  // Condición activa de minteo (para saber precio, etc)
  const { data: claimCondition } = useReadContract(getActiveClaimCondition, {
    contract,
    tokenId,
  });

  // Calcular el precio del token
  const price = toEther(
    BigInt(claimCondition?.pricePerToken?.toString() || "0")
  );

  return (
    <>
      <div className="bg-gradient-to-br from-blue-600 via-blue-400 to-white w-full h-full">
        <NavBar />

        <div className="flex flex-col items-center font-lexend pt-5">
          <div
            className="w-full lg:w-1/2 h-[550px] relative flex flex-col items-center justify-center bg-no-repeat bg-contain bg-center"
            style={{
              backgroundImage: "url('/divmint.svg')",
            }}
          >
            {/* Imagen del contrato */}
            {isContractMetadataLoading ? (
              <p>Loading...</p>
            ) : (
              <Image
  src="/apehands-lasvegas.jpg"
  alt="Apehands Las Vegas Edition"
  width={150}
  height={150}
  className="shadow-[5px_5px_0px_0px_rgba(0,0,0)]"
  style={{
    borderRadius: "15px",
    border: "3px solid black",
    marginBottom: "20px",
    objectFit: "cover",
  }}
/>
            )}

            {/* Nombre */}
            <h2 className="mb-3 font-titan text-white text-3xl uppercase">
              Apehands
            </h2>
            <h3 className="mb-3 text-white text-xl uppercase">Las Vegas Edition</h3>

            {/* Botón de minteo */}
            <div
              className="mt-4 pb-2 w-full h-16 bg-no-repeat bg-contain bg-center flex items-center justify-center"
              style={{ backgroundImage: "url('/mintbutton.svg')" }}
            >
              <TransactionButton
                disabled={isMinting}
                transaction={async () => {
                  setIsMinting(true);
                  return claimTo({
                    contract,
                    to: account?.address || "",
                    tokenId,
                    quantity: BigInt(1), // solo 1 NFT permitido por wallet
                  });
                }}
                onTransactionConfirmed={async () => {
                  alert("NFT minted!");
                  setIsMinting(false);
                }}
                onError={() => setIsMinting(false)}
                className="!bg-transparent !text-white !font-bold !uppercase"
              >
                {isMinting
                  ? "Minting..."
                  : price === "0"
                  ? "Mint (Free)"
                  : `Mint (${price} APE)`}
              </TransactionButton>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
