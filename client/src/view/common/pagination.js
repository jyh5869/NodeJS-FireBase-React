
import React, { useEffect, useState, Component} from "react";

import ToggleButton from 'react-bootstrap/ToggleButton';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import axios from 'axios'

/**
 * @returns prevDoc, nextDoc
 * @param type
*/
export default function Pagination (props) {
    console.log(props);
    let   [next     , setNext]     = useState("");
    let   [prev     , setPrev]     = useState("");

    let type       = props.useParams.type == undefined ? '' : props.useParams.type 
    let docList    = props.useParams.docList == undefined ? [] : props.useParams.docList
    let data       = props.useParams.data == undefined ? [] : props.useParams.data
    let prevTarget = props.useParams.prevTarget == NaN ? 0 : props.useParams.prevTarget;
    let url        = props.useParams.url;
    let docId      = type == "next" ? next : prev


    //리스트 가져오기
    const getMovieList = async (useParams, e) => {
        alert("함수호출");
        let type       = useParams.type == undefined ? '' : useParams.type 
        let docList    = useParams.docList == undefined ? [] : useParams.docList
        let docId      = useParams.docId;
        let prevTarget = useParams.prevTarget == NaN ? 0 : useParams.prevTarget;
        
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
        
        let prevDoc;
        let nextDoc;
        
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

    }

    
    
    return (
        <div className="pagination_wrap">
            <ButtonGroup className="pagination">
                <ToggleButton onClick={(e)=>{getMovieList({ type : 'prev', docId : prevDoc, docList : docList, prevTarget: prevTarget}, e)}} type="radio"variant={'outline-success'} name="radio"> &larr; 이전 </ToggleButton>
                <ToggleButton onClick={(e)=>{getMovieList({ type : 'next', docId : nextDoc, docList : docList, prevTarget: prevTarget}, e)}} type="radio"variant={'outline-primary'} name="radio"> 다음 &rarr; </ToggleButton>
            </ButtonGroup>
        </div>
    )
}
