import {Accordion, Button, Card, Form, ListGroup, Spinner} from "react-bootstrap";
import {useEffect, useState} from "react";
import genx from "genx"

export const Generation = (props) => {
    const {
       onSelect,
       selectedAsset,
       generation,
       genes,
       contract,
       fetchGenerations,
       eventKey
    } = props;
    const [g, setGenes] = useState(genes);
    const [modified, setModified] = useState(false)
    const [msg, setMsg] = useState("")

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

    const onUpdate = async (gene, type, value) => {
        setMsg(`Updating property ${gene}`);
        const version = genx.genx.version(generation);
        const nerf = await genx.genx.nerf(contract,
                        selectedAsset,
                        gene, type, value,
                        version[0], version[1], version[2])
        setMsg(`Updating genes`);
        await fetchGenerations(selectedAsset);
        setMsg(``);
    }

    const onMutate = async () => {
        setMsg(`Starting mutation`);
        const version = genx.genx.version(generation);
        const new_genes = Object.entries(g).map(([key, value]) => {
            return [key, genx.genx.gene(value.type_, value.value)];
        })
        const genes = Object.fromEntries(new_genes)
        const mutate = genx.genx.mutate(contract,
                                        selectedAsset, genes,
                                        version[0], version[1], version[2]);
        setMsg(`Mutation in progress`);
        await fetchGenerations(selectedAsset);
        setMsg(``);
    }

    return <Accordion.Item eventKey={eventKey} style={{ width: '28rem' }}>
           <Accordion.Header as="h5">{!msg ? generation :
             <div>
                 <Spinner animation="border" variant="success" /> {msg}
             </div>
           }</Accordion.Header>
           <Accordion.Body>
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
        </Accordion.Body>
        <div style={{display: 'flex', justifyContent: 'space-around'}}>
            <Button variant="outline-danger"  onClick={() => onSelect(g)}>Evolve</Button>
            <Button variant="outline-primary" onClick={addGene}>Add Gene</Button>
            <Button variant="outline-warning" onClick={onMutate} disabled={!modified}>Mutate</Button>

        </div>
    </Accordion.Item>
}

export default function Generations({selectedAsset, generations, contract, fetchGenerations, onSelect}) {
    console.log(generations)
    return <div>
        <Accordion>
            { Object.keys(generations).map((generation, key) => <Generation eventKey={key} selectedAsset={selectedAsset} key={generation} generation={generation} genes={generations[generation]} contract={contract} fetchGenerations={fetchGenerations} onSelect={onSelect}/>)}
        </Accordion>
        <Button variant="outline-danger" onClick={() => onSelect({}) }>Evolve</Button>

    </div>
}