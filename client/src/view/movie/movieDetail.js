
import React,  {useEffect, useState } from 'react';
import { useParams }                  from 'react-router-dom';
import { Card, Button,Table  }        from 'react-bootstrap';

import axios from 'axios';

/**
 * 영화 상세보기 페이지
 * @returns
*/
function MovieDetail(props) {
   
    let {id} = useParams();
    var color = [ "danger", "warning", "info", "primary", "secondary", "success" ];

    const [list1, setMovieReco1] = useState([]);
    const [list2, setMovieReco2] = useState([]);
    const [obj  , setMovieInfo ] = useState([]);

    const getMovieInfo = async () => {

        let response = await axios.get('/api/movieDetail', {
            params: {
                id: id
            }
        });
        
        //JSON형태의 문자열의 Value를 추출하여 특정 문자열로 연결 
        response.data.rows.genres = jsonToString(JSON.parse(response.data.rows.genres), " ")
        response.data.rows.production_companies = jsonToString(JSON.parse(response.data.rows.production_companies), ", " )

        setMovieInfo(response.data.rows);
    }

    //추천 상품 리스트 호출 머신러닝
    const getMovieRecommended = async () => {

        let response = await axios.get('/api/movieRecommended',{
            params: {
                id: id
            }
        });
        
        //배열을 특정 문자로 나눈 문자열로 반환 ( 문자 : ㄴ/ )
        for(var i = 0 ; i < response.data.recommArr1.length; i++){
            response.data.recommArr1[i].genres = arrToString(response.data.recommArr1[i].genres, " / ")
        }
        for(var i = 0 ; i < response.data.recommArr2.length; i++){
            response.data.recommArr2[i].genres = arrToString(response.data.recommArr2[i].genres, " / ")
        }

        setMovieReco1(response.data.recommArr1)
        setMovieReco2(response.data.recommArr2)
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
                    <Card.Title as="h3">
                        {obj.title} 
                    </Card.Title>
                    <Card.Text as="h5" >
                        {obj.title} ({obj.original_language})
                    </Card.Text>
                    <Card.Text as="h5" >
                        {obj.overview} 
                    </Card.Text>
                    <Table responsive="sm">
                        <thead>
                            <tr>
                                <th className="text-center">태그라인</th>
                                <th className="text-center">장르</th>
                                <th className="text-center">개봉일/상영시간</th>
                                <th className="text-center">언어</th>
                                <th className="text-center">평점</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr> 
                                <td className="text-center">{obj.tagline}</td>
                                <td className="text-center">{obj.genres}</td>
                                <td className="text-center">{obj.release_date} ({obj.runtime}분)</td>
                                <td className="text-center">{obj.production_companies}</td>
                                <td className="text-center">{obj.vote_average}</td>
                            </tr>                   
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
            
            <h1 className="text-center p-3">유사 내용 영화 추천</h1>      
            <Table  responsive="sm">
                <thead>
                    <tr>
                    <th className="text-center">순번</th>
                    <th className="text-center">영화제목</th>
                    <th className="text-center">장르</th>
                    <th className="text-center">평점</th>
                    </tr>
                </thead>
                <tbody>
                {
                    list1.length != 0
                    ?
                        list1.map((list, index) => (   
                            <tr key={list.id}> 
                                <td className="text-center">{index+1}</td>
                                <td className="text-center"><a href={url + list.id} key={list.id} className="text-center" >{list.title}</a></td>
                                <td className="text-center">{list.genres}</td>
                                <td className="text-center">{list.vote_average}</td>
                            </tr>                   
                        ))
                    : 
                        <tr><td colSpan={4} className="text-center" >추천 데이터가 존재하지 않습니다.</td></tr>
                    }
                </tbody>
            </Table>
            
            <h1 className="text-center p-3">유사 장르, 감독, 배우별 영화 추천</h1>
            <Table striped bordered hover size="sm">
                <thead>
                    <tr>
                    <th className="text-center">순번</th>
                    <th className="text-center">영화제목</th>
                    <th className="text-center">장르</th>
                    <th className="text-center">평점</th>
                    </tr>
                </thead>
                <tbody>
                    {
                    list2.length != 0
                    ?
                        list2.map((list, index) => (   
                            <tr key={list.id}> 
                                <td className="text-center">{index+1}</td>
                                <td className="text-center"><a href={url + list.id} key={list.id} className="text-center" >{list.title}</a></td>
                                <td className="text-center">{list.genres}</td>
                                <td className="text-center">{list.vote_average}</td>
                            </tr>                   
                        ))
                    : 
                        <tr><td colSpan={4} className="text-center" >추천데이터가 존재하지 않습니다.</td></tr>
                    }
                </tbody>
            </Table>              
        </React.Fragment>
    )
}

function jsonToString(chgArr, splitChar){

    var chgStr = "";
    for(var i = 0 ; i < chgArr.length; i++){

        if(i == 0){
            chgStr = chgStr + chgArr[i].name
        }
        else{
            chgStr = chgStr + splitChar + chgArr[i].name
        }
    }
    return chgStr;
}

function arrToString(chgArr, splitChar){

    var chgStr = "";
    for(var i = 0 ; i < chgArr.length; i++){

        if(i == 0){
            chgStr = chgStr + chgArr[i]
        }
        else{
            chgStr = chgStr + splitChar + chgArr[i]
        }
    }
    return chgStr;
}

export default MovieDetail 