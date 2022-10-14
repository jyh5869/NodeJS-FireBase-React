
import React, { useEffect, useState } from "react";
import axios from 'axios';

/**
 * 영화 리스트 페이지
 * @returns
*/
function MovieList() {

    const [list     , setList]     = useState([]);
    const [targetId , setTargetId] = useState();
    var color = [ "danger", "warning", "info", "primary", "secondary", "success" ];

    //리스트 가져오기
    const getMovieList = async (doc_id) => {

        let response = await axios({
            method  : 'get',
            url     : '/api/',
            params  : {
                'doc_id' : doc_id
            },
            headers : {
                'Content-Type' : 'multipart/form-data'
            },
        })
        console.log(response.data)
        setList(response.data.rows);
    }

    useEffect(() => {
        getMovieList();
    },  []);

    const url = '/view/movieDetail/'
    
    //JSX 식으로 리스트 파싱
    return (
        <React.Fragment>
            <h1>영화 리스트</h1>        
            <div className="mx-0 my-3">
                {list.map((list, index) => ( 
                    <a href={url + list.id} key={list.id} className="text-center" >    
                        <div className={"cardWrap card border-"+ color[Number(index%6)] +" col-md-5 m-2"} >
                            <div className={"card-header bg-"+ color[Number(index%6)]}>{list.original_title}</div>
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
                <button onclick={getMovieList(targetId)}>next</button>
            </div>                
        </React.Fragment>
    )
}

export default MovieList;