
import React,  { useState } from 'react';
import { useParams }        from 'react-router-dom';
import { Card, Button }     from 'react-bootstrap';

import Data from '../../data';


/**
 * @author 신발 상세정보 컴포넌트
 * @returns 신발 상세정보 HTML
**/
function ShoseDetail(props) {

    let [shoes, shoeState] = useState(Data);

    let {id} = useParams();

    return (
        <Card className="text-center">
            <Card.Header as="h5">Featured</Card.Header>
            <Card.Body>
                <Card.Img variant="top" src={shoes[id].img} />
                <Card.Title>
                    <p> {shoes[id].title}</p>
                </Card.Title>
                <Card.Text >
                    {shoes[id].content}
                </Card.Text>
                <Card.Text >
                    {shoes[id].price}
                </Card.Text>
                <Button variant="primary">Buy Now</Button>
            </Card.Body>
            <Card.Footer className="text-muted">2 days ago</Card.Footer>
        </Card>
    )
}

export default ShoseDetail 