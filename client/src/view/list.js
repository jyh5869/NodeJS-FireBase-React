
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardGroup } from 'react-bootstrap';

//import { name1, name2 } from './data';
import Data from '../data';

function List() {

    let [shoes, shoeState] = useState(Data);
    
    return (
        
        <div className="row">
            {/* <h1>{name1} + {name2} </h1> -> 파라메터 파싱 방법 */}
            
            {/* 반복문 */}
            {shoes.map((num, i) => {
                return <Cards shoes={num} i={i} key={i} />;
            })}
            
            {
            /* 비 반복문
                <Card shoes={shoes[0]} />
                <Card shoes={shoes[1]} />
                <Card shoes={shoes[2]} />
            */}
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

export default List 