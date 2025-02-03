import { chain } from "@/app/chain";
import { client } from "@/app/client";
import { getContract } from "thirdweb";
import { stakingContractABI } from "./stakingContractABI";

const nftContractAddress = "0x80EAB3eD8f3c664827ac46dff9dd1758Ee402622";
const rewardTokenContractAddress = "0xd0130f4efCC837498130Cb82a7D14C33Eb4a30e6";
const stakingContractAddress = "0xF81CeC94EFA58c31433e078991555C759E70A2ed";

export const NFT_CONTRACT = getContract({
    client: client,
    chain: chain,
    address: nftContractAddress,
});

export const REWARD_TOKEN_CONTRACT = getContract({
    client: client,
    chain: chain,
    address: rewardTokenContractAddress,
});


export const STAKING_CONTRACT = getContract({
    client: client,
    chain: chain,
    address: stakingContractAddress,
    abi: stakingContractABI,

});