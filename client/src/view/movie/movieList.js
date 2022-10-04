

import React, { useEffect, useState } from "react";

import axios from 'axios';

function MovieList() {

    const [list, setList] = useState([]);
    var color = [ "danger", "warning", "info", "primary", "secondary", "success" ];

    //리스트 가져오기
    const getHeroes = async () => {

        let response = await axios.get('/api');

        setList(response.data.rows);
    }

    useEffect(() => {
        getHeroes();
    },  []);

    const url = '/view/movieDetail/'
    
    //JSX 식으로 리스트 파싱
    return (
        <React.Fragment  >
            {/* <h1>Our new Products</h1> */}        
            <div className="my-5 mx-1">

                {list.map((list, index) => ( 
                <a href={url + list.id} key={list.id} className="text-center" >    
                <div className={"cardWrap card border-"+ color[Number(index%6)] +" col-md-5 m-2"} >
                    <div className={"card-header bg-"+ color[Number(index%6)]}>{list.original_title} (개봉: {list.release_date})   {list.id} </div>
                    <div className={"card-body text-" + color[Number(index%6)]} >
                        {/* 
                            랜덤 이미지 링크 1, 2
                            <img src={"https://source.unsplash.com/random/200x200?sig="+index} alt ="not exist" />
                            <img src={"https://picsum.photos/200/300?random="+index} alt ="not exist" /> 
                        */}
                        <p className="card-text">{ list.tagline !== "" ? list.tagline : " - " }</p>                        
                    </div>
                </div>
                </a>    
                ))}
            </div>                
        </React.Fragment>
    )
}

export default MovieList;