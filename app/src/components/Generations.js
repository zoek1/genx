import {Button, Card, Form, ListGroup} from "react-bootstrap";
import {useEffect, useState} from "react";
import genx from "genx"

export const Generation = ({selectedAsset, generation, genes, contract, fetchGenerations}) => {
    const [g, setGenes] = useState(genes);

    useEffect(() => {
        setGenes(genes);
    }, [genes])

    const updateName = (name, new_name) => {
        const state = {...g[name]};
        const new_g = {...g, [new_name]: state}
        delete new_g[name];
        setGenes(new_g);
    }

    const updateType = (name, type) => {
        const state = {...g[name], type_: type};
        setGenes({...g, [name]: state});
    }

    const updateValue = (name, type) => {
        const state = {...g[name], value: type};
        setGenes({...g, [name]: state});
    }

    const addGene = () => {
        setGenes({...g, "": {type_: "string", value: ""}})
    }

    const onUpdate = async (gene, type, value) => {
        const version = genx.genx.version(generation);
        const nerf = await genx.genx.nerf(contract,
                        selectedAsset,
                        gene, type, value,
                        version[0], version[1], version[2])
        console.log(nerf)
        await fetchGenerations(selectedAsset)
    }
    return <Card style={{ width: '18rem' }}>
           <Card.Header as="h5">{generation}</Card.Header>

           <ListGroup variant="flush">
        {
          Object.keys(g).map((gene, index) =>  {
            return <ListGroup.Item key={index}>
              <Form>
                <Form.Group className="mb-3" controlId="form">
                  <Form.Label>Gene Name</Form.Label>
                  <Form.Control value={gene}
                                onChange={(e) => updateName(gene, e.target.value)}
                                type="text"
                                placeholder="Enter Gene Name" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="form">
                  <Form.Label>Gene Type</Form.Label>
                  <Form.Select aria-label="Gene type"
                               onChange={e => updateType(gene, e.target.value)}
                               value={g[gene].type_}>
                    <option>Open this select menu</option>
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="form">
                  <Form.Label>Gene Value</Form.Label>
                  <Form.Control value={g[gene].value}
                                onChange={e => updateValue(gene, e.target.value)}
                                type="text"
                                placeholder="Enter Gene Name" />
                </Form.Group>
                  { gene ?
                      <Button variant="outline-primary" onClick={() => onUpdate(gene, g[gene].type_, g[gene].value)} >Update</Button> :
                      <></>
                  }
              </Form>
            </ListGroup.Item>
          })
        }
        </ListGroup>
        <Button variant="outline-primary" onClick={addGene}>Add Gene</Button>
        <Button variant="outline-warning">Mutate</Button>

    </Card>
}

export default function Generations({selectedAsset, generations, contract, fetchGenerations}) {
    console.log(generations)
    return <>
        { Object.keys(generations).map(generation => <Generation selectedAsset={selectedAsset} key={generation} generation={generation} genes={generations[generation]} contract={contract} fetchGenerations={fetchGenerations}/>)}
        <Button variant="outline-danger">Evolve</Button>

    </>
}