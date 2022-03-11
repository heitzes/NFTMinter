import { useEffect, useState } from "react";
import { upLoad } from "./util/upload.js";
import { connectWallet, getCurrentWalletConnected, mintNFT } from "./util/interact1.js";
import React from "react";
const FormData = require("form-data");

const Minter1 = props => {
    const [walletAddress, setWallet] = useState("");
    const [status, setStatus] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    //set pinurl -> this is used for image url, not json url
    const [pinurl, setpin] = useState("");
    const [imageSrc, setImageSrc] = useState("");
    const adminWallet = "0x612B9C1860566f0A83F106e893933F86533F6eDe";

    useEffect(async () => {
        const { address, status } = await getCurrentWalletConnected();

        setWallet(address);
        setStatus(status);

        addWalletListener();
    }, []);

    function addWalletListener() {
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", accounts => {
                if (accounts.length > 0) {
                    setWallet(accounts[0]);
                    setStatus("👆🏽 Write a message in the text-field above.");
                } else {
                    setWallet("");
                    setStatus("🦊 Connect to Metamask using the top right button.");
                }
            });
        } else {
            setStatus(
                <p>
                    {" "}
                    🦊{" "}
                    <a target="_blank" href={`https://metamask.io/download.html`}>
                        You must install Metamask, a virtual Ethereum wallet, in your browser.
                    </a>
                </p>
            );
        }
    }

    const connectWalletPressed = async () => {
        const walletResponse = await connectWallet();
        setStatus(walletResponse.status);
        setWallet(walletResponse.address);
    };

    const onMintPressed = async () => {
        //use pinurl which was generated when you upload image file
        console.log(pinurl);
        if (pinurl) {
            const { success, status } = await mintNFT(pinurl, name, description);
            setStatus(status);
            if (success) {
                setName("");
                setDescription("");
                setpin("");
            }
        }
    };
    const onImgChange = async e => {
        //when you upload image file, use upLoad promise to generate url of that image
        //upLoad promise uses pinata API for non-json file
        e.preventDefault();
        if (e.target.files) {
            const uploadFile = e.target.files[0];
            const formData = new FormData();
            formData.append("file", uploadFile);
            //formData has information of selected image file
            const { success, pinataUrl } = await upLoad(formData);
            //set pinurl to pinataUrl so that we can use generated image url in mintNFT at line 58
            success && setpin(pinataUrl);
        }
    };

    const apiPressed = async e => {
        if (window.ethereum.selectedAddress == adminWallet.toLowerCase()) {
            var api = require("etherscan-api").init("ZFI8UWGX2NJB99DUEAC84ZTI1G7B5H4339");
            var txlist = api.account.txlist("0x1A92f7381B9F03921564a437210bB9396471050C");
            txlist.then(function (txlist) {
                console.log(txlist);
            });
        } else {
            console.log("Not admin");
        }
    };

    return (
        <div className="Minter">
            <button id="walletButton" onClick={connectWalletPressed}>
                {walletAddress.length > 0 ? (
                    "Connected: " +
                    String(walletAddress).substring(0, 6) +
                    "..." +
                    String(walletAddress).substring(38)
                ) : (
                    <span>Connect Wallet</span>
                )}
            </button>

            <br></br>
            <h1 id="title">🧙‍♂️ NFT Minter</h1>
            <p>Simply add your asset's link, name, and description, then press "Mint."</p>
            <form>
                <h2>🖼 Link to asset: </h2>
                <input type="file" accept="img/*" onChange={onImgChange} />
                <h2>🤔 Name: </h2>
                <input
                    type="text"
                    placeholder="e.g. My first NFT!"
                    onChange={event => setName(event.target.value)}
                />
                <h2>✍️ Description: </h2>
                <input
                    type="text"
                    placeholder="e.g. Even cooler than cryptokitties ;)"
                    onChange={event => setDescription(event.target.value)}
                />
            </form>
            <button id="mintButton" onClick={onMintPressed}>
                Mint NFT
            </button>
            <button id="apiButton" onClick={apiPressed}>
                Get API
            </button>
            <p id="status" style={{ color: "red" }}>
                {status}
            </p>
        </div>
    );
};

export default Minter1;
