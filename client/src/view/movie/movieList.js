
import React, { useEffect, useState, Component} from "react";
import axios from 'axios';

import ToggleButton from 'react-bootstrap/ToggleButton';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

// import Pagination from '../common/pagination';

/**
 * 영화 리스트 페이지
 * @returns
*/
let docList = [];
let docListId = [];
// let prevTarget = 0;

function MovieList() {

    const [list     , setList]     = useState([]);
    const [docList      , setDocList]  = useState();
    let   [prevTarget     , setPrevTarget]     = useState("");
    let   [next     , setNext]     = useState("");
    let   [prev     , setPrev]     = useState("");
    
    const radios = [
        { name: 'Active', value: '1' },
        { name: 'Radio', value: '3' },
      ];

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
        
        // console.log("prevTarget = " + prevTarget)
        // console.log(docListId)

        setPrev(prevDoc)
        setNext(nextDoc)
        setList(data);
    }








    //리스트 가져오기
    const getMovieList22 = async (useParams, e) => {
        
        let type       = useParams.type == undefined ? '' : useParams.type 
        let docId      = useParams.docId;
        let docList    = useParams.docList == undefined ? [] : useParams.docList
        let prevTarget = useParams.prevTarget == undefined ? 0 : useParams.prevTarget;

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

        var pagingArr = pagination(data, type, docList, prevTarget );
        
        console.log(pagingArr[0])
        console.log(pagingArr[1])
        console.log(pagingArr[2])
        console.log(pagingArr[3])
        console.log(docListId)

        setPrev(pagingArr[0])
        setNext(pagingArr[1])
        setDocList(pagingArr[2])
        setPrevTarget(pagingArr[3])
        setList(data);

    }

    useEffect(() => {
        getMovieList22({});
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

                <div className="pagination_wrap">
                    {/* <Pagination useParams={{ data : 'list', url : "/api"}}></Pagination> */}
                    
                    
                    <ButtonGroup className="pagination">
                        <ToggleButton onClick={(e)=>{getMovieList22({ type : 'prev', docId : prev, docList : docList, prevTarget : prevTarget}, e)}} type="radio"variant={'outline-success'} name="radio"> &larr; 이전 </ToggleButton>
                        <ToggleButton onClick={(e)=>{getMovieList22({ type : 'next', docId : next, docList : docList, prevTarget : prevTarget}, e)}} type="radio"variant={'outline-primary'} name="radio"> 다음 &rarr; </ToggleButton>
                    </ButtonGroup>  
                    
                   
                </div>
            </div>                
        </React.Fragment>
    )
}


function pagination (data, type, docList, prevTarget ) {
    
    let prevDoc = "PPP";
    let nextDoc = "NNN";
    
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

        //배열 중복 제거(만약 다음 페이지가 이전페이지 호출등의 이유로 이미 호출 했을 경우 배열에 쌓지 않기 위함)
        const set1 = new Set(docList);
        docList = [...set1];

        docListId.push(data[0].id)//호출한 페이지의 문서 아이디값 추가
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
    
    let pagingArr = [prevDoc, nextDoc, docList, prevTarget]

    return pagingArr;

}


export default MovieList;