import { balanceOf } from "thirdweb/extensions/erc20";
import { TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { useEffect } from "react";
import { prepareContractCall, toEther } from "thirdweb";
import { REWARD_TOKEN_CONTRACT, STAKING_CONTRACT } from "../../utils/contracts";
import Image from "next/image";




export const NavRewards = () => {
    const account = useActiveAccount();
    const {
        data: tokenBalance,
        isLoading: isTokenBalanceLoading,
        refetch: refetchTokenBalance,
    } = useReadContract(
        balanceOf,
        {
            contract: REWARD_TOKEN_CONTRACT,
            address: account?.address || "",
        }
    );

    const {
        data: stakedInfo,
        refetch: refetchStakedInfo,
    } = useReadContract({
        contract: STAKING_CONTRACT,
        method: "getStakeInfo",
        params: [account?.address || ""],
    });

    useEffect(() => {
        refetchStakedInfo();
        const interval = setInterval(() => {
            refetchStakedInfo();
        }, 1000);
        return () => clearInterval(interval);
    }, []);

// Set the number of decimals supported by the token contract
const decimals = 6;

    return (
        <div  className="text-center font-lexend">
            <div>
            {!isTokenBalanceLoading && (
                <>
                <div className="drop-shadow-[0_20px_50px_rgba(255,_239,_15,_0.7)] gap-4 pb-4 w-full h-24 bg-no-repeat bg-contain bg-center flex items-center justify-center "
                style={{backgroundImage:"url('/divbalance.svg", width:"500px" }}>
                <p className="text-xl bg-[#4a3d5d] border-2 border-solid border-[#352341] shadow-inner px-6 py-2 rounded-lg text-white font-bold">{parseFloat(toEther(BigInt(tokenBalance!.toString()))).toFixed(2)}</p>
               {/* <p className="text-xl bg-[#4a3d5d] border-2 border-solid border-[#352341] shadow-inner px-6 py-2 rounded-lg text-white font-bold">
  {tokenBalance ? parseFloat(toEther(BigInt(tokenBalance.toString()))).toFixed(2) : "0.00"}
</p> */}

                <Image
                                                                          aria-hidden
                                                                          src="/bananotkn.svg"
                                                                          alt="Banano Token logo"
                                                                          width={50}
                                                                          height={50} />
                </div></>
            )}
            </div>            
        </div>
    );

    // Format the balance with decimals
   // stakedInfo = (parseInt(stakedInfo) / 10 ** decimals).toFixed(decimals);

};