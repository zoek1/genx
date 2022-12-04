import {Button, Card, Form, ListGroup} from "react-bootstrap";
import {useEffect, useState} from "react";
import genx from "genx"

export default function EditorGeneration({genes, contract, selectedAsset, onSave}) {
    const [g, setGenes] = useState(genes);
    const [modified, setModified] = useState(false)

    useEffect(() => {
        setGenes(genes);
    }, [genes])

    const updateName = (name, new_name) => {
        const state = {...g[name]};
        const new_g = {...g, [new_name]: state}
        delete new_g[name];
        setGenes(new_g);
        setModified(true);
    }

    const updateType = (name, type) => {
        const state = {...g[name], type_: type};
        setGenes({...g, [name]: state});
        setModified(true);
    }

    const updateValue = (name, type) => {
        const state = {...g[name], value: type};
        setGenes({...g, [name]: state});
        setModified(true);
    }

    const addGene = () => {
        setGenes({...g, "": {type_: "string", value: ""}})
    }

    const onEvolve = async () => {
        const new_genes = Object.entries(g).map(([key, value]) => {
            return [key, genx.genx.gene(value.type_, value.value)];
        })
        const genes = Object.fromEntries(new_genes)
        const op = await genx.genx.evolve(contract,
                                        selectedAsset, genes);

        await onSave();
    }

    return <Card style={{ width: '28rem' }}>
           <Card.Header as="h5">Evolve Editor</Card.Header>

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
              </Form>
            </ListGroup.Item>
          })
        }
        </ListGroup>
        <Button variant="outline-primary" onClick={addGene}>Add Gene</Button>
        <Button variant="outline-success" onClick={onEvolve} >Evolve</Button>

    </Card>
}