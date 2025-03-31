import { client } from "@/app/client";
import { useState } from "react";
import { NFT, prepareContractCall } from "thirdweb"
import { MediaRenderer, TransactionButton } from "thirdweb/react";
import { approve } from "thirdweb/extensions/erc721";
import { IoClose } from "react-icons/io5";
import styles from "@/app/page.module.css";
import Link from "next/link";
import { NFT_CONTRACT, STAKING_CONTRACT } from "../../utils/contracts";
import { FaRegCircle, FaRegCircleCheck } from "react-icons/fa6";



export const Canvas = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isApproved, setIsApproved] = useState(false);

    return(
        <div>
           
        </div>
    )
};