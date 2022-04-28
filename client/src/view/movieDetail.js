
import React,  {useEffect, useState } from 'react';
import { useParams }                  from 'react-router-dom';
import { Card, Button,Table  }        from 'react-bootstrap';

import axios from 'axios';

function MovieDetail(props) {
   
    let {id} = useParams();
    var color = [ "danger", "warning", "info", "primary", "secondary", "success" ];

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
        setMovieReco(response.data.rows);
    }

    useEffect(() => {
        getMovieRecommended();
        getMovieInfo();
    },  []);

    const url = '/view/movieDetail/'
    
    return (
        <React.Fragment> 
            <Card className="text-center  mx-5 my-5" >
                <Card.Header className="bg-info" as="h5">MOVIE DETAIL</Card.Header>
                <Card.Body className="warning">
                    {/*<Card.Img variant="top" className='m-4' src={list[id].img} /> */}
                    <Card.Title as="h3">
                        {obj.title}
                    </Card.Title>
                        <img  className="movie detail my-3" src={"https://source.unsplash.com/random/200x200?sig=1"} alt ="not exist" />
                    <Card.Text as="h5" >
                        {obj.title}
                    </Card.Text>
                    <Card.Text as="h5" >
                        {obj.overview}
                    </Card.Text>
                    <Button variant="primary m-5">Watch Now</Button>
                </Card.Body>
                <Card.Footer className="text-muted bg-info">{obj.release_date}</Card.Footer>
            </Card>
            
            {/* <h1>Our new Products</h1> */}        

            <Table striped bordered hover size="sm">
                <thead>
                    <tr>
                    <th className="text-center">순번</th>
                    <th className="text-center">영화제목</th>
                    <th className="text-center">수치</th>
                    <th className="text-center">유사도</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map((list, index) => (   
                        <tr key={list.id}> 
                            <td className="text-center">{index+1}</td>
                            <td className="text-center"><a href={url + list.id} key={list.id} className="text-center" >{list.title}</a></td>
                            <td className="text-center">{list.vote_average}</td>
                            <td className="text-center">{list.weighted_vote}</td>
                        </tr>                   
                    ))}
                </tbody>
            </Table>                
        </React.Fragment>
    )
}

export default MovieDetail 