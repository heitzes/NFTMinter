require("dotenv").config();
const key = process.env.REACT_APP_PINATA_KEY;
const secret = process.env.REACT_APP_PINATA_SECRET;
const axios = require("axios");

export const upLoad = async file => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const metadata = JSON.stringify({
        name: "test",
    });
    file.append("pinataMetadata", metadata);

    return axios
        .post(url, file, {
            maxBodyLength: "Infinity", //this is needed to prevent axios from erroring out with large files
            headers: {
                "Content-Type": `multipart/form-data; boundary=${file._boundary}`,
                pinata_api_key: key,
                pinata_secret_api_key: secret,
            },
        })
        .then(function (response) {
            console.log(response);
            return {
                success: true,
                pinataUrl: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash,
            };
        })
        .catch(function (error) {
            console.log(error);
            return {
                success: false,
                message: error.message,
            };
        });
};
