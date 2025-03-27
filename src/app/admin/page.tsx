"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getContractEvents, getContract } from "thirdweb";
import { ConnectButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { AdminAddress, AdminAddress2, NFT_CONTRACT } from "../../../utils/contracts";
import { STAKING_CONTRACT } from "../../../utils/contracts";
import { client } from "../client";
import { chain } from "../chain";
import NavBar from "@/components/NavBar";
import { getAllOwners, getTotalClaimedSupply, nextTokenIdToMint } from "thirdweb/extensions/erc721";


export default function Admin() {
  const account = useActiveAccount();
  const adminAddress = AdminAddress;
  const adminAddress2 = AdminAddress2;

  const isAdmin = account?.address === adminAddress || account?.address === adminAddress2;



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


// Función para descargar CSV
// Función para descargar CSV
const downloadCSV = () => {
  // Obtener la fecha y hora actual
  const downloadDate = new Date().toLocaleString().replace(/[\/:]/g, '-'); // Reemplazamos / y : por - para evitar problemas en los nombres de archivos

  // Contamos el total de staked desde el estado de los stakers
  const totalStaked = Array.from(walletFrequencies.values()).reduce((sum, count) => sum + count, 0);

  // Construimos el contenido CSV
  const csvContent = "data:text/csv;charset=utf-8," +
    // Agregamos la fecha y hora de la descarga
    `"Fecha de descarga: ${downloadDate}"\n\n` +
    // Resumen de la colección
    `"Resumen de colección"\n` +
    `"Minted: ${claimedSupply?.toString()}/${totalNFTSupply?.toString()}"\n` +
    `"Total Wallets: ${totalWallets}"\n\n` +
    // Resumen de Stakers
    `"Resumen de Stakers"\n` +
    `"Total wallets: ${walletFrequencies.size}"\n` +
    `"Total staked: ${totalStaked}"\n\n` +
    // Mapeamos los datos de cada wallet
    uniqueWallets.map(wallet => {
      return `${wallet.wallet},${wallet.nftCount},${wallet.staked},${wallet.noStaked}`;
    }).join("\n");

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








  return (
    <section className="w-full h-full justify-center items-center bg-[#e8e8e8] text-black">
      {/* Navbar */}
      <NavBar />

      {/* Si no hay wallet conectada */}
      {!account ? (
        <div className="flex flex-col items-center h-screen justify-center font-lexend">
          <h1 className="mb-[25px] text-lg">Connect your wallet</h1>
          <div className="mb-[150px]">
            <ConnectButton client={client} connectModal={{ size: "compact", showThirdwebBranding: false }} />
          </div>
        </div>
) : !isAdmin ? (
          /* Si la wallet conectada no es admin */
        <div className="flex flex-col items-center h-screen justify-center font-lexend">
          <h1 className="mb-[25px] text-lg">You are not the Admin</h1>
          <button className="bg-[#212121] rounded-xl h-[50px] mb-[150px] text-white px-4">
            <Link href={"/"}>Go to Home</Link>
          </button>
        </div>
      ) : (
        /* Si la wallet es admin */
        <>
              <div className="p-6">
              <h1 className="text-xl font-bold">Collection summary</h1>
              <p>
              <strong> Minted:</strong> {claimedSupply?.toString()}/{totalNFTSupply?.toString()}
              </p>
              <p><strong>Total Wallets:</strong> {totalWallets}</p>

                <h1 className="text-xl font-bold">Resumen de Stakers</h1>
                <p><strong>Total wallets:</strong> {walletFrequencies.size}</p>
                <p><strong>Total staked:</strong> {totalStaked}</p>

                <button
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={downloadCSV}
                >
                  Download CSV
                </button>

                <div className="p-6">
  <h2>Lista de Wallets</h2>
  <table className="min-w-full table-auto">
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
          {uniqueWallets.map((wallet, index) => (
            <tr key={wallet.wallet} className="border-b">
              <td className="px-4 py-2">{wallet.index}</td>
              <td className="px-4 py-2">{wallet.wallet}</td>
              <td className="px-4 py-2">{wallet.nftCount}</td>
              <td className="px-4 py-2">{wallet.staked}</td>
              <td className="px-4 py-2">{wallet.noStaked}</td>
            </tr>
          ))}
        </tbody>
      </table>
  </div>


                
  </div>
  
              
    </>

      )}
    </section>
  );
}
