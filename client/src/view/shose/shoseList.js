
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardGroup } from 'react-bootstrap';

import Data from '../../data';


/**
 * @author 신발 리스트 컴포넌트
 * @returns 신발 리스트 HTML
**/
function ShoseList() {

    let [shoes, shoeState] = useState(Data);
    
    return (
        
        <div className="row">
            {shoes.map((num, i) => {
                return <Cards shoes={num} i={i} key={i} />;
            })}
        </div>
    )

    function Cards(props){

        let id = props.shoes.id;
        const url = '/view/detail/'+id
        
        return (    
            <CardGroup className="col-md-4">
                <Card className="text-center">
                    <Link  to={url} >
                        <Card.Img variant="top" src={props.shoes.img} />
                        <Card.Body>
                            <Card.Title>{ props.shoes.title }</Card.Title>
                            <Card.Text>
                                { props.shoes.content }
                            </Card.Text>
                            <Card.Text>
                                { props.shoes.price }
                            </Card.Text>
                        </Card.Body>
                    </Link>
                    <Card.Footer>
                        <small className="text-muted">Last updated 3 mins ago</small>
                    </Card.Footer>
                </Card>
            </CardGroup>
        )
    }
}

export default ShoseList 