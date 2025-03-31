"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getContractEvents, getContract } from "thirdweb";
import { ConnectButton, MediaRenderer, useActiveAccount, useReadContract } from "thirdweb/react";
import { AdminAddress, AdminAddress2, NFT_CONTRACT } from "../../../utils/contracts";
import { STAKING_CONTRACT } from "../../../utils/contracts";
import { client } from "../client";
import { chain } from "../chain";
import NavBar from "@/components/NavBar";
import { getAllOwners, getTotalClaimedSupply, nextTokenIdToMint } from "thirdweb/extensions/erc721";
import { getContractMetadata } from "thirdweb/extensions/common";
import { createWallet } from "thirdweb/wallets";
import Footer from "@/components/Footer";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";


export default function Admin() {
  const account = useActiveAccount();
  const adminAddress = AdminAddress;
  const adminAddress2 = AdminAddress2;

  const isAdmin = account?.address === adminAddress || account?.address === adminAddress2;

   const wallets = [
          createWallet("io.metamask"),
          createWallet("com.coinbase.wallet"),
          createWallet("me.rainbow"),
          createWallet("io.rabby"),
          createWallet("app.phantom"),
        ];

  // Obtener contrato de staking
  const contract = getContract({
    client: client,
    chain: chain,
    address: STAKING_CONTRACT.address,
  });

  // Obtener contrato de Ape Hands
  const handsContract = getContract({
    client: client,
    chain: chain,
    address: NFT_CONTRACT.address,
  });
  
  
      const { data: claimedSupply, isLoading: isClaimSupplyLoading } = useReadContract( getTotalClaimedSupply,
          { contract: handsContract}
      );
  
      const { data: totalNFTSupply, isLoading: isTotalSupplyLoading } = useReadContract( nextTokenIdToMint,
          { contract: handsContract}
      );

      
    // contract metadata
    
    const { data: contractMetadata, isLoading: isContractMetadataLoading } = useReadContract( getContractMetadata,
      { contract: handsContract}
  );


  // Generar lista de tokenIds de 0 a 3332
  const tokenIds = Array.from({ length: 3333 }, (_, i) => i);

  // Llamar a `stakerAddress` para cada tokenId
  const stakerResults = tokenIds.map((tokenId) =>
    useReadContract({
      contract,
      method: "function stakerAddress(uint256) view returns (address)",
      params: [BigInt(tokenId)],
    })
  );

  // Filtrar solo los tokens que tienen un staker válido
  const stakers = stakerResults
    .map(({ data }, index) => ({ tokenId: index, staker: data }))
    .filter(({ staker }) => staker && staker !== "0x0000000000000000000000000000000000000000");


  const countWallets = (wallets: string[]) => {
    const walletCount = new Map<string, number>();
  
    for (const wallet of wallets) {
      walletCount.set(wallet, (walletCount.get(wallet) || 0) + 1);
    }
  
    return walletCount;
  };
  
// Obtener la lista de wallets filtrando valores undefined
const walletList = stakers.map(({ staker }) => staker).filter(Boolean) as string[];  
  // Calcular la frecuencia
  const walletFrequencies = countWallets(walletList);

  // Calcular el total de "veces staked"
const totalStaked = Array.from(walletFrequencies.values()).reduce((sum, count) => sum + count, 0);


const downloadCSV = () => {
  // Obtener la fecha y hora actual
  const downloadDate = new Date().toLocaleString().replace(/[\/:]/g, '-'); // Evita caracteres problemáticos en el nombre

  // Filtrar wallets excluyendo la dirección del contrato de staking
  const filteredWallets = uniqueWallets.filter(
    (wallet) => wallet.wallet.toLowerCase() !== STAKING_CONTRACT.address.toLowerCase()
  );

  // Contamos el total de staked desde el estado de los stakers
  const totalStaked = Array.from(walletFrequencies.values()).reduce((sum, count) => sum + count, 0);

  // Construimos el contenido CSV
  const csvContent = "data:text/csv;charset=utf-8," +
    // Agregamos la fecha y hora de la descarga
    `"Fecha de descarga: ${downloadDate}"\n\n` +
    // Resumen de la colección
    `"Resumen de colección"\n` +
    `"Minted: ${claimedSupply?.toString()}/${totalNFTSupply?.toString()}"\n` +
    `"Total Wallets: ${totalWallets - 1}"\n\n` +
    // Resumen de Stakers
    `"Resumen de Stakers"\n` +
    `"Total wallets: ${walletFrequencies.size}"\n` +
    `"Total staked: ${totalStaked}"\n\n` +
    // Encabezado de la tabla
    `"Wallet, NFT Count, Staked, No Staked"\n` +
    // Mapeamos los datos de cada wallet filtrada
    filteredWallets.map(wallet => 
      `${wallet.wallet},${wallet.nftCount},${wallet.staked},${wallet.noStaked}`
    ).join("\n");

  // Creamos el nombre del archivo con la fecha y hora
  const fileName = `ApeHands Summary - ${downloadDate}.csv`;

  // Creamos un enlace para la descarga del archivo CSV
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", fileName); // Asignamos el nombre con la fecha y hora
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};



// holders sin stake
const [holders, setHolders] = useState<{ wallet: string; count: number }[]>([]);
const [loadingHolders, setLoadingHolders] = useState(true);
const [hasFetched, setHasFetched] = useState(false); // Nueva variable para evitar recargas

useEffect(() => {
  if (!handsContract || !claimedSupply || hasFetched) return; // Solo ejecuta una vez

  setHasFetched(true); // Marcar que ya se ejecutó
  setLoadingHolders(true);

  const fetchHolders = async () => {
    try {
      const owners = await getAllOwners({
        contract: handsContract,
        start: 0,
        count: Number(claimedSupply),
      });

      // Contar cuántos NFTs tiene cada wallet
      const walletCount = new Map<string, number>();
      owners.forEach(({ owner }) => {
        walletCount.set(owner, (walletCount.get(owner) || 0) + 1);
      });

      // Convertir a array y ordenar de mayor a menor
      const sortedHolders = Array.from(walletCount.entries())
        .map(([wallet, count]) => ({ wallet, count }))
        .sort((a, b) => b.count - a.count);

      setHolders(sortedHolders);
    } catch (error) {
      console.error("Error obteniendo holders:", error);
    } finally {
      setLoadingHolders(false);
    }
  };

  fetchHolders();
}, [handsContract, claimedSupply]);


// Wallets únicas
const [uniqueWallets, setUniqueWallets] = useState<{ index: number, wallet: string, nftCount: number, staked: number, noStaked: number }[]>([]);

// Usamos useMemo para evitar la recalculación innecesaria
const holdersStakersData = useMemo(() => {
  return { holders, stakers };
}, [holders, stakers]);

useEffect(() => {
  // Aseguramos que los datos sean válidos
  if (!holders || !stakers) return;

  const walletCountMap = new Map<string, { staked: number, noStaked: number }>();

  // Contamos NFTs en holders
  holders.forEach(({ wallet, count }) => {
    if (wallet) {
      const currentCount = walletCountMap.get(wallet) || { staked: 0, noStaked: 0 };
      walletCountMap.set(wallet, { ...currentCount, noStaked: currentCount.noStaked + count });
    }
  });

  // Contamos NFTs en stakers (para NFTs en staking)
  stakers.forEach(({ staker, tokenId }) => {
    if (staker) {
      const currentCount = walletCountMap.get(staker) || { staked: 0, noStaked: 0 };
      walletCountMap.set(staker, { ...currentCount, staked: currentCount.staked + 1 });
    }
  });

  // Convertimos el mapa en un array y lo ordenamos
  const sortedWallets = Array.from(walletCountMap.entries())
    .map(([wallet, { staked, noStaked }]) => ({
      wallet,
      nftCount: staked + noStaked,
      staked,
      noStaked,
    }))
    .sort((a, b) => b.nftCount - a.nftCount); // Ordenamos de mayor a menor por nftCount

  // Asignamos la numeración consecutiva después de ordenar
  const walletsWithIndex = sortedWallets.map((item, index) => ({
    ...item,
    index: index + 1, // Numeración consecutiva de 1 a N
  }));

  // Actualizamos solo si hay un cambio en los datos
  setUniqueWallets((prevState) => {
    if (JSON.stringify(prevState) !== JSON.stringify(walletsWithIndex)) {
      return walletsWithIndex;
    }
    return prevState; // No actualizamos el estado si no hay cambios
  });
}, [holdersStakersData]);



const totalWallets = uniqueWallets.length;

const filteredWallets = uniqueWallets.filter(
  (wallet) => wallet.wallet.toLowerCase() !== STAKING_CONTRACT.address.toLowerCase()
);

const downloadCSVWallet = () => {
  // Obtener la fecha y hora actual
  const downloadDate = new Date().toLocaleString().replace(/[\/:]/g, '-'); // Evita caracteres problemáticos en el nombre

  // Filtrar wallets excluyendo la dirección del contrato de staking
  const filteredWallets = uniqueWallets.filter(
    (wallet) => wallet.wallet.toLowerCase() !== STAKING_CONTRACT.address.toLowerCase()
  );

  // Construir el contenido CSV
  const csvContent = "data:text/csv;charset=utf-8," +
    filteredWallets.map(wallet => wallet.wallet).join("\n"); // Solo las direcciones de wallets

  // Crear el nombre del archivo con la fecha
  const fileName = `ApeHands holders - ${downloadDate}.csv`;

  // Generar y descargar el archivo CSV
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};








  return (
    <section className="w-full h-full justify-center items-center bg-gradient-to-br from-blue-600 via-blue-400 to-white text-black">
      {/* Navbar */}
      <NavBar />

      <>
              <div className="p-6">

                 {/* header */}
              <div className="flex flex-col lg:flex-row justify-between mt-6">
                {/* header left side */}
            <div className="flex flex-col justify-start">
              <div className="flex flex-col lg:flex-row justify-start">
              <MediaRenderer
            client={client}
            src={contractMetadata?.image}
            style={{borderRadius: "15px", width: "100px", height: "100px", marginBottom: "20px", marginRight: "20px", border: '2px solid white'}}

            /> 
            <div>
              <h1 className="text-white text-[42px] font-lexend font-bold">{contractMetadata?.name}</h1>
              <p className="text-black font-lexend">
               <a
                href={`https://apescan.io/address/${handsContract.address}`} // Reemplázalo con la red que uses
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:opacity-75 cursor-pointer"
              >
               <span>{handsContract.address}</span><span><FaArrowUpRightFromSquare /></span>  

              </a> 
              </p>
            </div>             
              
              </div>
              
            </div>
            {/* header right side */}

            <div className="relative inline-flex items-center justify-start gap-4 group font-lexend">
  <button className="mt-4 bg-black text-white px-4 py-2 rounded"
  >
    Download ▼
  </button>
  <div className="absolute hidden group-hover:block bg-white shadow-md rounded mt-1 w-full z-10">
    <button
      className="block w-full text-left px-4 py-2 hover:bg-gray-200"
      onClick={downloadCSV}
    >
      Details List
    </button>
    <button
      className="block w-full text-left px-4 py-2 hover:bg-gray-200"
      onClick={downloadCSVWallet}
    >
      Holder List
    </button>
  </div>
</div>
  
              </div>

                      {/* div for cards */}


                      <div className="flex flex-col lg:flex-row items-center w-full space-y-4 lg:space-y-0 lg:space-x-4 mt-[35px] mb-[50px]">

{/*Card 1*/}
<div className="flex flex-col bg-white rounded-3xl w-full lg:w-1/2 font-lexend">
  <div className="px-6 py-8 sm:p-10 sm:pb-6">
    <div className="grid items-center justify-center w-full grid-cols-1 text-left">
      <div>
        <h2
          className="text-lg font-medium tracking-tighter text-gray-600 lg:text-3xl"
        >
          NFTs minted
        </h2>
      </div>
      <div className="mt-6">
      <p>
    <span className="text-5xl font-light tracking-tight text-black">
    {claimedSupply?.toString()}
    </span>
    <span className="text-base font-medium text-gray-500"> /{totalNFTSupply?.toString()} </span>
  </p>
      </div>
    </div>
  </div>
</div>

{/*Card 2*/}
<div className="flex flex-col bg-white rounded-3xl w-full lg:w-1/2  font-lexend">
  <div className="px-6 py-8 sm:p-10 sm:pb-6">
    <div className="grid items-center justify-center w-full grid-cols-1 text-left">
      <div>
        <h2
          className="text-lg font-medium tracking-tighter text-gray-600 lg:text-3xl"
        >
          NFTs staked
        </h2>
      </div>
      <div className="mt-6">
      <p>
    <span className="text-5xl font-light tracking-tight text-black">
    {totalStaked}
    </span>
    <span className="text-base font-medium text-gray-500"> / {walletFrequencies.size} stakers </span>
  </p>
      </div>
    </div>
  </div>
</div>

{/*Card 3*/}
<div className="flex flex-col bg-white rounded-3xl w-full lg:w-1/2  font-lexend">
  <div className="px-6 py-8 sm:p-10 sm:pb-6">
    <div className="grid items-center justify-center w-full grid-cols-1 text-left">
      <div>
        <h2
          className="text-lg font-medium tracking-tighter text-gray-600 lg:text-3xl"
        >
          Total holders
        </h2>
      </div>
      <div className="mt-6">
      <p>
    <span className="text-5xl font-light tracking-tight text-black">
    {totalWallets - 1}
    </span>
  </p>
      </div>
    </div>
  </div>
</div>




</div>
                  {/* ^^^ End div for cards ^^^ */}


                <div className="p-6 bg-white rounded-3xl font-lexend">
  <table className="min-w-full table-auto ">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border">#</th>
            <th className="px-4 py-2 border">Wallet</th>
            <th className="px-4 py-2 border">NFT Count</th>
            <th className="px-4 py-2 border">Staked</th>
            <th className="px-4 py-2 border">No Staked</th>
          </tr>
        </thead>
        <tbody>
        {filteredWallets.map((wallet, index) => (
            <tr key={wallet.wallet} className="border-b">
              <td className="px-4 py-2">{wallet.index - 1}</td>
              <td className="px-4 py-2">{wallet.wallet}</td>
              <td className="px-4 py-2">{wallet.nftCount}</td>
              <td className="px-4 py-2">{wallet.staked}</td>
              <td className="px-4 py-2">{wallet.noStaked}</td>
            </tr>
          ))}
        </tbody>
      </table>
  </div>

        <Footer/>

                
  </div>
  
              
    </>
    </section>
  );
}
