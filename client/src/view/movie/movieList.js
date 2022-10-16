
import React, { useEffect, useState } from "react";
import axios from 'axios';

/**
 * 영화 리스트 페이지
 * @returns
*/
let docList = [];
let docListId = [];
let prevTarget = 0;

function MovieList() {

    const [list     , setList]     = useState([]);
    const [targetId , setTargetId] = useState();
    let [next     , setNext]     = useState("");
    let [prev     , setPrev]     = useState("");
    
    var color = [ "danger", "warning", "info", "primary", "secondary", "success" ];
    
    //리스트 가져오기
    const getMovieList = async (useParams, e) => {
        
        let type  = useParams.type == undefined ? '' : useParams.type 
        let docId = type == "next" ? next : prev

        let response = await axios({
            method  : 'get',
            url     : '/api',
            params  : {
                'doc_id' : docId ,
                'type'   : type
            },
            headers : {
                'Content-Type' : 'multipart/form-data'
            },
        })


        var data = response.data.rows

        if(type == "prev"){
            
            prevTarget++

            if(prevTarget == docList.length - 1 ){
                prevTarget--
            }    
        }
        else if(type == "next" || type == ""){
            docList.push(data[0].doc_id)
            docListId.push(data[0].id)


            const set1 = new Set(docList);
            docList = [...set1];

            const set2 = new Set(docListId);
            docListId = [...set2];
            
            if(prevTarget != 0 ) {
                prevTarget--
            }
        }

        console.log("prevTarget = " + prevTarget)
        console.log(docListId)

        setPrev(type == "" ? docList[0] : docList[docList.length - (prevTarget + 2)])
        setNext(data[Number(data.length-1)].doc_id)
        
        setList(data);
    }

    useEffect(() => {
        getMovieList({});
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
                            <div className={"card-header bg-"+ color[Number(index%6)]}>{list.id}</div>
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
                <button onClick={(e)=>{getMovieList({ type : 'prev'}, e)}} > ◁ prev </button>
                <button onClick={(e)=>{getMovieList({ type : 'next'}, e)}} > next ▷ </button>
            </div>                
        </React.Fragment>
    )
}

export default MovieList;