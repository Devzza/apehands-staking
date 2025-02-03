import { balanceOf } from "thirdweb/extensions/erc20";
import { TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { useEffect } from "react";
import { prepareContractCall, toEther } from "thirdweb";
import { REWARD_TOKEN_CONTRACT, STAKING_CONTRACT } from "../../utils/contracts";
import Image from "next/image";
import { SiGamebanana } from "react-icons/si";




export const StakeRewards = () => {
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
        <div  className="text-center font-lexend flex flex-col justify-between justify-items-center align-center gap-4 pb-6">
            <div className="text-center align-center justify-items-center mb-2">
                <Image
                                          aria-hidden
                                          src="/bananotkn.svg"
                                          alt="Banano Token logo"
                                          width={50}
                                          height={50} />
                <h4 className="mt-2 font-lexend text-white font-bold bg-[#4a3d5d] border-2 border-solid border-[#352341] shadow-inner px-4 py-2 rounded-lg ">EARNINGS</h4>

            </div>
            <div style={{
                textAlign: "center"
            }}>
                <p className="font-titan text-4xl text-white ">{stakedInfo && parseFloat(toEther(BigInt(stakedInfo[1].toString()))).toFixed(2)}</p>
                </div>

                <div className=" w-full h-24 bg-no-repeat bg-contain bg-center flex items-center justify-center "
                style={{backgroundImage:"url('/claimrewards.svg", width:"auto" }}>
                
                
                
            <TransactionButton
                className="!bg-transparent !text-white !text-lg  "
                transaction={() => (
                    prepareContractCall({
                        contract: STAKING_CONTRACT,
                        method: "claimRewards"
                    })
                )}
                onTransactionConfirmed={() => {
                    alert("Rewards claimed!");
                    refetchStakedInfo();
                    refetchTokenBalance();
                }}
                style={{
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    width: "50%",
                    fontWeight:"bold"                }}
            >Collect</TransactionButton>
            </div>
            
        </div>
    );

    // Format the balance with decimals
   // stakedInfo = (parseInt(stakedInfo) / 10 ** decimals).toFixed(decimals);

};