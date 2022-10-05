
import React,  { useState } from 'react';
import { useParams }        from 'react-router-dom';
import { Card, Button }     from 'react-bootstrap';

import Data from '../../data';

/**
 * 신발정보 상세보기 페이지
 * @returns
*/
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