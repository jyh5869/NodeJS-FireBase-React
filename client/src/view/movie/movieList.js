
import React, { useEffect, useState, Component} from "react";
import axios from 'axios';

import ToggleButton from 'react-bootstrap/ToggleButton';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import Pagination from '../common/pagination';

/**
 * @author 영화 리스트 페이지
 * @returns
*/
function MovieList() {

    const [list      , setList      ] = useState([]);
    const [docList   , setDocList   ] = useState();
    let   [prevTarget, setPrevTarget] = useState("");
    let   [next      , setNext      ] = useState("");
    let   [prev      , setPrev      ] = useState("");
    
    const radios = [
        { name: 'Active', value: '1' },
        { name: 'Radio', value: '3' },
      ];

    var color = [ "danger", "warning", "info", "primary", "secondary", "success" ];

    //리스트 가져오기
    const getMovieList = async (useParams, e) => {
        
        let type       = useParams.type       == undefined ? '' : useParams.type 
        let docList    = useParams.docList    == undefined ? [] : useParams.docList
        let prevTarget = useParams.prevTarget == undefined ? 0  : useParams.prevTarget;
        let docId      = useParams.docId;
        

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

        var pagingArr = Pagination(data, type, docList, prevTarget);

        setPrev(pagingArr[0])
        setNext(pagingArr[1])
        setDocList(pagingArr[2])
        setPrevTarget(pagingArr[3])
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
                                    <img src={"https://picsum.photos/200/300?random="+index} alt ="not exist" />*/}
                                <p className="card-text">{ list.tagline !== "" ? list.tagline : " - " }</p>                        
                            </div>
                        </div>
                    </a>    
                ))}
                {list.length != 0 ? 
                    <div className="pagination_wrap">      
                        <ButtonGroup className="pagination">
                            <ToggleButton onClick={(e)=>{getMovieList({ type : 'prev', docId : prev, docList : docList, prevTarget : prevTarget}, e)}} type="radio"variant={'outline-success'} name="radio"> &larr; 이전 </ToggleButton>
                            <ToggleButton onClick={(e)=>{getMovieList({ type : 'next', docId : next, docList : docList, prevTarget : prevTarget}, e)}} type="radio"variant={'outline-primary'} name="radio"> 다음 &rarr; </ToggleButton>
                        </ButtonGroup>  
                    </div>
                : "" }
            </div>                
        </React.Fragment>
    )
}

export default MovieList;