

import axios from 'axios';
import React, { useEffect, useState } from "react";

function ProdList() {

    const [list, setList] = useState([]);
    var color = [ "danger", "warning", "info", "primary", "secondary", "success" ];

    //리스트 가져오기
    const getHeroes = async () => {

        let response = await axios.get('/api');

        setList(response.data.rows);
    }

    //추천 상품 리스트 호출 머신러닝
    const getNdcg = async () => {

        //let response = await axios.get('/api/moviesDataInit');
    }

    useEffect(() => {
        getHeroes();
        getNdcg();
    },  []);

    const url = '/view/movieDetail/'
    //JSX 식으로 리스트 파싱
    return (
        <React.Fragment  >
            {/* <h1>Our new Products</h1> */}        
            <div className="my-5 mx-1">
                {list.map((list, index) => ( 

                <a href={url + list.movie_id} key={list.brdno} className="text-center" >    
                <div className={"card border-"+ color[Number(index%6)] +" col-md-5 m-2"} >
                    <div className={"card-header bg-"+ color[Number(index%6)]}>{list.original_title}</div>
                    <div className={"card-body text-" + color[Number(index%6)]} >
                        <img src={"https://source.unsplash.com/random/200x200?sig="+index} alt ="not exist" />
                        {/* 
                            랜덤 이미지 링크 2
                            <img src={"https://picsum.photos/200/300?random="+index} alt ="not exist" /> 
                        */}
                        <h5 className="card-title">{list.release_date}</h5>
                        <p className="card-text">{list.tagline}</p>
                    </div>
                </div>
                </a>    
                ))}
            </div>                
        </React.Fragment>
    )
}

export default ProdList;