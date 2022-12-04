import {Button, Card, ListGroup} from "react-bootstrap";

export const Asset = ({asset, fetchGenerations, contract}) => {
    const {token_id, token_info} = asset;

    return <Card style={{ width: '18rem' }} onClick={() => fetchGenerations(1)}>
      <Card.Header as="h5">{token_id} - {token_info?.name}</Card.Header>
      <ListGroup variant="flush">
          {Object.keys(token_info).filter((key) => key !== 'name').map((key) =>
              <ListGroup.Item>{key}: {token_info[key]}
        </ListGroup.Item>)}
      </ListGroup>
    </Card>;
}

export default function Assets({assets, fetchGenerations, contract}) {
    return <div>
        {assets.map(asset => <Asset  asset={asset} fetchGenerations={fetchGenerations} contract={contract}/>)}
        <Button variant="outline-success">Create Token</Button>
        </div>
}