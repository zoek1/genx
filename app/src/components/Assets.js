import {Accordion, Button, Card, ListGroup} from "react-bootstrap";
import ReactJson from "react-json-view";
import {useState} from "react";
import {getJSON} from "../utils/ipfs";

export const Asset = ({asset, fetchGenerations, contract, eventKey}) => {
    const {token_id, token_info} = asset;
    const [data, setData] = useState(token_info);

    useState(() => {
        if (token_info[""]?.startsWith("ipfs://")) {
            getJSON(token_info[""]).then((data) => {
                setData({...token_info, ...data})
            })
        }
    }, []);

    return <Accordion.Item eventKey={eventKey} style={{ width: '28rem' }} onClick={() => fetchGenerations(token_id)}>
      <Accordion.Header as="h5">{token_id} {data?.name}</Accordion.Header>
      <Accordion.Body>
        <ReactJson
            style={{marginTop: '55px', width: "26rem", overflowX: "auto"}}
            src={data}
        />
      </Accordion.Body>
    </Accordion.Item>;
}

export default function Assets({assets, fetchGenerations, contract, openEditor}) {
    return <div>
        <Accordion>
            {assets.map((asset, eventKey) => <Asset eventKey={eventKey}  asset={asset} fetchGenerations={fetchGenerations} contract={contract}/>)}
        </Accordion>
        <Button variant="outline-success" onClick={openEditor}>Create Token</Button>
        </div>
}