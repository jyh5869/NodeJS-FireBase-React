
import React,  {useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Card, Button  } from 'react-bootstrap';

import axios from 'axios';
import Data from '../data';

function MovieDetail(props) {
    var color = [ "danger", "warning", "info", "primary", "secondary", "success" ];
    let {id} = useParams();
    console.log(id);
    const [list, setMovieReco] = useState([]);
    const [obj, setMovieInfo] = useState([]);

    const getMovieInfo = async () => {

        let response = await axios.get('/api/movieDetail', {
            params: {
                id: id
            }
        });
        setMovieInfo(response.data.rows);
    }

    //추천 상품 리스트 호출 머신러닝
    const getMovieRecommended = async () => {

        let response = await axios.get('/api/movieRecommended',{
            params: {
                id: id
            }
        });
        //var obj = JSON.parse(response.data.rows)
        
        console.log(response.data.rows);
        setMovieReco(response.data.rows);

    }

    useEffect(() => {
        getMovieRecommended();
        getMovieInfo();
    },  []);
    const url = '/view/movieDetail/'
    //console.log(props);
    return (
<React.Fragment> 
     <Card className="text-center">
            <Card.Header as="h5">MOVIE DETAIL</Card.Header>
            <Card.Body>
                {/*<Card.Img variant="top" className='m-4' src={list[id].img} /> */}
                <Card.Title>
                    <p> {obj.title}</p>
                </Card.Title>
                <Card.Text >
                    <p>{obj.title}</p>
                    <p>{obj.title}</p>
                </Card.Text>
                <Button variant="primary">Buy Now</Button>
            </Card.Body>
            <Card.Footer className="text-muted">2 days ago</Card.Footer>
        </Card>


{/* <h1>Our new Products</h1> */}        
            <div >
                {list.map((list, index) => ( 
                    <a href={url + list.id} key={list.id} className="text-center" >
                    <div>
                        {list.title}{list.id}
                    </div>
                    </a>
                ))}
            </div>                  
</React.Fragment>
    )
}

export default MovieDetail 