'use client'

import Link from "next/link";
import { useState } from "react";
import { HiMenuAlt1 } from "react-icons/hi";
import Image from "next/image";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "@/app/client";
import { chain } from "@/app/chain";
import { PiHandEye } from "react-icons/pi";
import { NavRewards } from "./NavRewards";
import { SubNavRewards } from "./SubNavRewards";
import { createWallet } from "thirdweb/wallets";
import { AdminAddress, AdminAddress2 } from "../../utils/contracts";



export default function Navbar() {
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
      
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <><nav className="flex justify-between items-center px-8 items-center py-6">

          <section className="flex items-center gap-4">

              {/* Hamburguesa */}
              <HiMenuAlt1 className="text-3xl text-white sm:hidden cursor-pointer" onClick={toggleMenu} />
              {/* Logo */}
              <Link href={"/"}>
                  <Image
                      src="/apehandslogooutline.svg"
                      alt="Ape Hands logo"
                      width={115}
                      height={115}
                      priority />
              </Link>
          </section>

          {account && (
          <section className="hidden lg:block">
              <NavRewards />
          </section>
          )}

          {/* Menú grande */}
          <div className="flex items-center space-x-4 font-lexend font-bold">
              <div className="hidden sm:block">
                  
                  <a href="/mint" className="hover:bg-yellow-400 px-3 py-2 rounded-md">
                      Mint
                  </a>
                  <a href="/stake" className="hover:bg-yellow-400 px-3 py-2 rounded-md">
                      Stake
                  </a>
                  <a href="/smartwatch" className="hover:bg-yellow-400 px-3 py-2 rounded-md">
                      Smartwatch
                  </a>
                      
                  <a href="/admin" className="hover:bg-yellow-400 px-3 py-2 rounded-md">
                      Info
                  </a>
              </div>
              <ConnectButton
                  client={client}
                  chain={chain}
                  wallets={wallets}
                  connectModal={{
                      size: "wide",
                      showThirdwebBranding: false,
                  }} />
          </div>


          {/* Fondo oscuro */}
          {isOpen && (
              <div
                  className="fixed inset-0 lg:hidden bg-black/50 backdrop-blur-sm z-40"
                  onClick={closeMenu}
              ></div>
          )}


          {/* Menú deslizable */}
          <div
              className={`fixed lg:hidden flex flex-col justify-between top-0 left-0 w-64 h-full bg-black z-50 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out`}
          >

              {/*arriba*/}
              <div>
                  <div className="flex items-center justify-between px-4 py-4">
                      <PiHandEye className="text-white text-6xl bg-blue-600 rounded-md p-2" />
                      <button
                          onClick={toggleMenu}
                          className="text-white hover:text-gray-400 focus:outline-none focus:text-white"
                      >
                          <svg
                              className="h-6 w-6"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                          >
                              <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12" />
                          </svg>
                      </button>
                  </div>
                  <div className="mt-4 space-y-4">
                      <div className="flex flex-col justify-center items-center font-lexend">
                      <ConnectButton
                  client={client}
                  chain={chain}
                  wallets={wallets}
                  connectModal={{
                      size: "wide",
                      showThirdwebBranding: false,
                  }} />
                  </div>
                      
                      <a href="/mint" className="block text-lg px-4 py-2 font-lexend font-bold text-white hover:text-gray-400">
                          Mint
                      </a>
                      <a href="/stake" className="block text-lg px-4 py-2 font-lexend font-bold text-white hover:text-gray-400">
                          Stake
                      </a>

                      <a href="/smartwatch" className="block text-lg px-4 py-2 font-lexend font-bold text-white hover:text-gray-400">
                      Smartwatch
                  </a>
                      
                  <a href="/admin" className="block text-lg px-4 py-2 font-lexend font-bold text-white hover:text-gray-400">
                      Info
                  </a>
                    

                  </div>
              </div>

              {/*abajo*/}

              <div className="flex flex-row justify-center items-center mb-10 gap-6">

                  <a
                      href="https://discord.gg/2YEfWm4dXR"
                      target="_blank"
                      rel="noopener noreferrer"
                  >
                      <Image
                          aria-hidden
                          src="/discord.svg"
                          alt="discord logo"
                          width={24}
                          height={24} />
                  </a>
                  <a
                      href="https://x.com/boredonchain"
                      target="_blank"
                      rel="noopener noreferrer"
                  >
                      <Image
                          aria-hidden
                          src="/x-logo.svg"
                          alt="x logo"
                          width={24}
                          height={24} />
                  </a>
              </div>

          </div>




      </nav>
      {account && (
      <div className="block md:block lg:hidden">
        <SubNavRewards /></div>
        )}
        </>
      
  );
}
