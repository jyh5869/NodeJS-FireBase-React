
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
    let   [next     , setNext]     = useState("");
    let   [prev     , setPrev]     = useState("");
    
    var color = [ "danger", "warning", "info", "primary", "secondary", "success" ];
    
    //리스트 가져오기
    const getMovieList = async (useParams, e) => {
        
        let type  = useParams.type == undefined ? '' : useParams.type 
        let docId = type == "next" ? next : prev

        let nextDoc;
        let prevDoc;

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

        //이전 페이지를 호출 할 경우
        if(type == "prev"){
            prevTarget++//이전페이지 카운트 증가

            //첫페이지에서 이전 페이지 호출(이전페이지 카운트가 저장 리스트의 길이와 같을 경우)
            if(prevTarget == docList.length - 1 ){
                prevTarget--//이전페이지 카운트 감소(이후 이전 페이지 호출시에도 첫페이지를 호출 하기 위함)
            }

        }//다음 페이지를 호출 할 경우
        else if(type == "next" || type == ""){
            docList.push(data[0].doc_id)//호출한 페이지의 문서 아이디값 추가
            docListId.push(data[0].id)//호출한 페이지의 문서 인덱스값 추가

            //배열 중복 제거(만약 다음 페이지가 이전페이지 호출등의 이유로 이미 호출 했을 경우 배열에 쌓지 않기 위함)
            const set1 = new Set(docList);
            docList = [...set1];
            const set2 = new Set(docListId);
            docListId = [...set2];
            
            if(prevTarget != 0 ) {//첫페이지가 아닐 경우
                prevTarget-- //이전페이지 카운트 감소
            }
        }

        //다음페이지 눌렸을때 게시물 수가 countPerPage 이하힐때 마지막페이지로 간주
        if(type == "next" && data.length < 10){  
            nextDoc = data[0].doc_id
            prevDoc = type == "" ? docList[0] : docList[docList.length - (prevTarget + 2)]
        }
        else{//마지막 페이지가 아닐때
            nextDoc = data[Number(data.length-1)].doc_id
            prevDoc = type == "" ? docList[0] : docList[docList.length - (prevTarget + 2)]
        }
        
        console.log("prevTarget = " + prevTarget)
        console.log(docListId)

        setPrev(prevDoc)
        setNext(nextDoc)
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