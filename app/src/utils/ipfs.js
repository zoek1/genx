import {Web3Storage} from "web3.storage";

export const uploadJSON = async (data) => {
  const endpoint = 'https://api.web3.storage/upload';
  const headers = {
        'Authorization': `Bearer ${process.env.REACT_APP_WEB_STORAGE}`,
        'Content-Type': 'application/json'
  }

  const response = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers,
  })

  return await response.json();

}

export const getCidFrom = (url) => url.replace('ipfs://', '')

export const getJSON = async (url) => {
    const cid = getCidFrom(url);
    const client = new Web3Storage({ token: process.env.REACT_APP_WEB_STORAGE });
    const res = await client.get(cid);
    const files = await res.files();

    const ab = await files[0].arrayBuffer();
    const text = ab2str(ab);

    console.log(text)
    return JSON.parse(text);

}

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}