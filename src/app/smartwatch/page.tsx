"use client";

import { client } from "../client";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import {
  ConnectButton,
  MediaRenderer,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { chain } from "../chain";
import { createWallet } from "thirdweb/wallets";
import { useEffect, useRef, useState } from "react";
import { NFT_CONTRACT } from "../../../utils/contracts";

export default function Smartwatch() {
  const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
    createWallet("io.rabby"),
    createWallet("app.phantom"),
  ];

  const account = useActiveAccount();

  const [tokenId, setTokenId] = useState("");
  const [metadata, setMetadata] = useState<any>(null);
  const [isMinted, setIsMinted] = useState(true);

  const [searchTriggered, setSearchTriggered] = useState(false); // Nuevo estado para controlar la búsqueda

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedScreenImage, setSelectedScreenImage] = useState<File | null>(null); // Imagen de la pantalla seleccionada por el usuario
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploaded, setImageUploaded] = useState<boolean>(false);  // Controlar cuando la imagen está lista para ser renderizada


  // Función para manejar la subida de la imagen
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setImageFile(file);
      setImageUploaded(false);  // Resetear el estado de "upload" hasta que el usuario lo confirme
    }
  };

   // Función para confirmar el upload de la imagen
   const handleUpload = () => {
    if (imageFile) {
      setImageUploaded(true);  // Confirmamos que la imagen fue subida
    }
  };

  // Obtener el totalSupply (NFTs minteados)
  const { data: totalSupply } = useReadContract({
    contract: NFT_CONTRACT,
    method: "function totalSupply() view returns (uint256)",
    params: [],
  });

  // Obtener el tokenURI del NFT ingresado
  const { data: tokenUri } = useReadContract({
    contract: NFT_CONTRACT,
    method: "function tokenURI(uint256 _tokenId) view returns (string)",
    params: searchTriggered && tokenId ? [BigInt(tokenId)] as const : [BigInt(0)] as const,
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!searchTriggered || !tokenId || !totalSupply) return;

      // Verificar si el NFT ha sido minteado
      if (parseInt(tokenId) >= Number(totalSupply)) {
        setIsMinted(false);
        setMetadata(null);
        return;
      }

      setIsMinted(true);

      if (!tokenUri) {
        setMetadata(null);
        return;
      }

      try {
        const metadataUrl = tokenUri.replace("ipfs://", "https://ipfs.io/ipfs/");
        const response = await fetch(metadataUrl);
        const data = await response.json();
        setMetadata(data);
      } catch (error) {
        console.error("Error obteniendo metadata:", error);
        setMetadata(null);
      }
    };

    fetchMetadata();
  }, [searchTriggered, tokenId, totalSupply, tokenUri]);

  // Función para manejar la búsqueda
  const handleSearch = () => {
    setSearchTriggered(true);
  };








  const [selectedSmartwatch, setSelectedSmartwatch] = useState<"smartwatch1" | "smartwatchblack" | "smartwatchblue" | "smartwatchyellow">("smartwatch1");

  const handleSmartwatchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as "smartwatch1" | "smartwatchblack" | "smartwatchblue" | "smartwatchyellow";
    setSelectedSmartwatch(value);
  };

useEffect(() => {
    if (!metadata?.image || !canvasRef.current || !selectedSmartwatch) return;
  
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
  
    if (!ctx) {
      console.error("No se pudo obtener el contexto 2D del canvas.");
      return;
    }
  
    const smartwatches = {
      smartwatch1: "bafybeib4w6w5frd2do7bf4rqmm6izh2kcms5l2tqmxfhonunzu2lp2ag7u/smartwatch.png",
      smartwatchblack: "bafybeiek44xrunn63aiw76tlus7ajo6qosqpnuaz42mordjgw6224rzax4/smartwatch-black.png",
      smartwatchblue: "bafybeiek44xrunn63aiw76tlus7ajo6qosqpnuaz42mordjgw6224rzax4/smartwatch-blue.png",
      smartwatchyellow: "bafybeiek44xrunn63aiw76tlus7ajo6qosqpnuaz42mordjgw6224rzax4/smartwatch-yellow.png",
    };
  
    const renderCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
  
      // 1️⃣ Renderizar el NFT (Background)
      const nftImage = new Image();
      nftImage.crossOrigin = "anonymous";
      nftImage.src = metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  
      nftImage.onload = () => {
        ctx.drawImage(nftImage, 0, 0, canvas.width, canvas.height);
  
        // 2️⃣ Renderizar la pantalla
        const screenImage = new Image();
        screenImage.crossOrigin = "anonymous";
        screenImage.src = "https://ipfs.io/ipfs/bafybeib4w6w5frd2do7bf4rqmm6izh2kcms5l2tqmxfhonunzu2lp2ag7u/pantalla.png";
  
        screenImage.onload = () => {
          ctx.drawImage(screenImage, 0, 0, canvas.width, canvas.height);
  
          // 3️⃣ Renderizar la imagen subida por el usuario
          if (imageUploaded && imageFile) {
            const userImage = new Image();
            const reader = new FileReader();
  
            reader.onload = (event) => {
              if (event.target && event.target.result) {
                userImage.src = event.target.result as string;
  
                userImage.onload = () => {
                  const screenX = 445, screenY = 25, screenSize = 115;
                  ctx.clearRect(screenX, screenY, screenSize, screenSize);
                  ctx.imageSmoothingEnabled = true;
                  ctx.imageSmoothingQuality = "high";
                  ctx.drawImage(userImage, screenX, screenY, screenSize, screenSize);
  
                  // 4️⃣ Renderizar el smartwatch encima
                  const deviceImage = new Image();
                  deviceImage.crossOrigin = "anonymous";
                  deviceImage.src = `https://ipfs.io/ipfs/${smartwatches[selectedSmartwatch]}`;
  
                  deviceImage.onload = () => {
                    ctx.drawImage(deviceImage, 0, 0, canvas.width, canvas.height);
                  };
                };
              }
            };
  
            reader.readAsDataURL(imageFile);
          } else {
            // 4️⃣ Renderizar el smartwatch si no hay imagen subida
            const deviceImage = new Image();
            deviceImage.crossOrigin = "anonymous";
            deviceImage.src = `https://ipfs.io/ipfs/${smartwatches[selectedSmartwatch]}`;
  
            deviceImage.onload = () => {
              ctx.drawImage(deviceImage, 0, 0, canvas.width, canvas.height);
            };
          }
        };
      };
    };
  
    renderCanvas();
  }, [metadata, selectedSmartwatch, imageUploaded, imageFile]);
  



const downloadImage = () => {
  const canvas = canvasRef.current;
  if (!canvas) {
    console.error('Canvas is not initialized');
    return;
  }

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');

  // Usamos metadata.name para definir el nombre del archivo
  const fileName = `${metadata.name}.png`; // Aquí usamos template literals para evaluar metadata.name
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  return (
    <>  
    <div
        style={{width:"100%"}}
        className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-400 to-white">
        
        <NavBar />

        <div className="flex flex-col items-center font-lexend pt-7 min-h-screen">
        <div className="flex flex-col justify-center items-center">
              <div className="flex flex-row gap-4 mb-4">
              <input
        type="text"
        placeholder="Introduce tokenId"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        className="border p-2 rounded-md"
      />
      <button
          onClick={handleSearch}
          className="p-2 rounded-lg bg-black text-white font-lexend"
        >
          Search
        </button>
              </div>



      {!isMinted && searchTriggered && <p className="text-red-500 mt-2">Not minted yet</p>}


            
      {metadata && isMinted && (
                    <div className="mt-4 px-6 flex flex-col justify-center items-center">
                      <h2 className="text-lg font-bold mb-4 font-lexend font-bold px-4">{metadata.name}</h2>
                      <canvas
  ref={canvasRef}
  width="1000"
  height="1000"
  style={{ border: '1px solid black' }}
  className="w-full rounded-xl sm:w-96 md:w-512 sm:h-96 md:h-512"
/>                            

{/* Sección para seleccionar la imagen de superposición (smartwatch u otras) */}
      {/* Selector de smartwatch */}
      <div className="bg-white p-4 font-lexend rounded-lg w-full mt-4 mb-4 flex flex-col">
      <p className="mb-4 font-bold">Choose a smartwatch:</p>
      <select
    value={selectedSmartwatch}
    onChange={handleSmartwatchChange}
        className="p-2 border"
  >
    <option value="">Seleccionar</option> {/* Opción por defecto */}
    <option value="smartwatch1">Smartwatch leather</option>
    <option value="smartwatchblack">Smartwatch black</option>
    <option value="smartwatchblue">Smartwatch blue</option>
    <option value="smartwatchyellow">Smartwatch yellow</option>
  </select>
      </div>

{/* Subir imagen para la pantalla */}
<div className="bg-white p-4 font-lexend rounded-lg w-full">
  <p className="mb-4 font-bold">Upload an image for your smartwatch background:</p>
<input type="file" onChange={handleImageUpload} accept="image/*" />
</div>



{/* Botón Upload */}
<div className="flex flex-col justify-center items-center mt-4 w-full">

  
<button onClick={handleUpload} disabled={!imageFile} className="mb-2 p-2 rounded-lg bg-black text-white font-lexend w-full"
>
  Upload
</button>



<button onClick={downloadImage} className="mb-2 p-2 rounded-lg bg-black text-white font-lexend w-full"
>
Download
</button>


</div>

<div className="bg-gradient-to-br from-yellow-200 to-yellow-400 p-12 font-lexend rounded-lg mt-4 mb-4 flex flex-col items-center w-full">
  
      <p className="mb-4 text-black font-bold text-2xl">Grab some Ape hands!</p>
      <button className="mb-2 p-2 rounded-lg bg-black text-white font-lexend w-1/2"
>
<a href="/mint">
                      Go to mint
                  </a></button>
        
      </div>
                    </div>
                  )}
                </div>
        </div>
        <Footer/>
      </div>

    </>
    )
}
