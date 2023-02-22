import {abi , contractAddresses} from "../constants/index"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import {ethers} from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance(){
    const { chainId: chainIdHex , isWeb3Enabled, Moralis} = useMoralis()
    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(chainIdHex)
    console.log(contractAddresses)
    const lotteryAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const dispatch = useNotification()

    const [entrenceFee, setEntrenceFee] = useState("0")
    const [numberOfPlayers, setNumberOfPlayers] = useState("0")
    const [recentWinner, SetRecentWinner] = useState("0")

    const {runContractFunction: enterLottery, isLoading, isFetching} = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "enterLottery",
        params: {},
        msgValue: entrenceFee
    })

    const {runContractFunction: getEntranceFee} = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const {runContractFunction: getNumberOfPlayers} = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const {runContractFunction: getRecentWinner} = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUi(){
        const entrenceFeeFromCall = (await getEntranceFee()).toString()
        const numPlayerFromCall = (await getNumberOfPlayers()).toString()
        const recentWinnerFromCall = await getRecentWinner()
        setEntrenceFee(entrenceFeeFromCall)
        setNumberOfPlayers(numPlayerFromCall)
        SetRecentWinner(recentWinnerFromCall)
    }

    useEffect(() => {
        if(isWeb3Enabled){
            updateUi()
        }
    },[isWeb3Enabled])

    const handleSuccess = async (tx) => {
        tx.wait(1)
        await updateUi()
        handleNewNotification()     
    }

    const handleNewNotification = function (){
        dispatch({
            type: "info",
            message: "Transaction Completed",
            title: "Tx notification",
            position: "topR",
            icon: "bell"
        })
    }

    return(
        <div className="p-5">
            Hi Lottery Entrance 
            {lotteryAddress ? (
                <div>
                    <div>Entrence Fee : {ethers.utils.formatUnits(entrenceFee, "ether")}</div>
                    <div>Eth number of players: {numberOfPlayers}</div>
                    <div>Recent Winner: {recentWinner}</div>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white text-bold py-2 px-4 rounded-2xl cursor-pointer"
                     onClick={async () => 
                        {
                            await enterLottery({
                                onSuccess: handleSuccess,
                                onError: (error) => {console.log(error)}
                            })
                        }}
                        disabled={isLoading || isFetching}
                        >{isLoading || isFetching ? <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full">

                        </div> : <div>Enter Lottery</div>}</button>
                </div>
            ): (
                <div>
                    No Lottery Address Detected
                </div>)}
            
        </div>
    )
}