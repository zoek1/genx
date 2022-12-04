import {useState} from "react";
import ReactJson from 'react-json-view'
import {Button} from "react-bootstrap";
import genx from 'genx';
import {uploadJSON} from "../utils/ipfs";

export default function TokenEditor(props) {
    const {contract, onUpdate} = props;
    const [token, setToken] = useState({
        name: "",
        symbol: "",
        decimals: ""

    })

    const onJsonChange = ({updated_src}) => {
      console.log(updated_src);
      setToken(updated_src);
    }

    const onMint = async () => {
        if (!Object.keys(token).length) return;
        const storage = await contract.storage();
        const new_token = {...token}
        let ref;
        if (token['""'] !== undefined || token[' '] !== undefined) {
            const data = new_token['""'] || new_token[' '];
            delete new_token['""'];
            delete new_token[' '];
            ref = {"": data, ...new_token}
        } else {
            const json = await uploadJSON(new_token);
            ref = {"": `ipfs://${json["cid"]}`}
        }

        const tokenId = genx.genx.getLastTokenId(storage);
        const op = await genx.genx.create_token(contract, tokenId, ref);
        const op1 = await genx.genx.add_gen(contract, tokenId, {}, 0)
        await onUpdate();
    }

    return <div>
        <Button onClick={onMint} style={{float: "right"}} variant="outline-success">Mint</Button>
        <ReactJson
            style={{marginTop: '55px', maxWidth: "600px", width: "600px"}}
            src={token}
            onEdit={onJsonChange}
            onAdd={onJsonChange}
            onDelete={onJsonChange}
        />


    </div>;

}