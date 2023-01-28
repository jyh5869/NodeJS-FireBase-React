import React,  {useEffect, useState } from 'react';
import {Table, Button, ToggleButton, ButtonGroup } from 'react-bootstrap';

import axios from 'axios';

import Pagination from '../common/pagination';
import SelectBox  from '../common/selectBox';


/**
 * @author 모델 훈련결과 리스트 컴포넌트
 * @returns 모델 훈련결과 리스트 HTML
**/
function List() {

    const [list, setList] = useState([]);
    const [docList   , setDocList   ] = useState();
    const [prevTarget, setPrevTarget] = useState("");
    const [next      , setNext      ] = useState("");
    const [prev      , setPrev      ] = useState("");
    const [modelNm   , setModelNm   ] = useState("");

    const [modelCateList, setModelCateList] = useState([]);
    const [modelNmList  , setModelNmList  ] = useState([]);

    const getFlowerGrwResult = async (useParams, e) => {

        let type       = useParams.type;       
        let docList    = useParams.docList;   
        let prevTarget = useParams.prevTarget; 
        let docId      = useParams.docId;
        let modelNm    = useParams.modelNm;

        let response = await axios({
            method: 'get',
            url: '/api/getTrainingHist',
            params: {
                'callType' : 'select',
                'docId'    : docId ,
                'type'     : type , 
                'modelNm'  : modelNm,
            },
            headers: {
              'Content-Type': 'multipart/form-data',
            },
        })

        var pagingArr = Pagination(response.data.rows, type, docList, prevTarget);
        console.log(pagingArr[4]);
        setPrev(pagingArr[0])
        setNext(pagingArr[1])
        setDocList(pagingArr[2])
        setPrevTarget(pagingArr[3])
        setList(pagingArr[4]);
        setModelNm(modelNm);
    }


    const deleteClass = async (useParams, e) => {

        let flag  = window.confirm('해당 훈련 이력을 삭제 하시겠습니까?\n추 후 이력 파악이 원할하지 않을 수 있습니다.');
        
        if(flag){

            let response = await axios({
                method: 'get',
                url: '/api/getTrainingHist',
                params: {
                    callType   : useParams.callType
                    , targetId : useParams.targetId
                },
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            getFlowerGrwResult('select');
        }
        
    };

    const showDetail = (useParams, e) =>{
        
        const toggletarget = document.getElementsByClassName('detail_'+useParams.index);
        const toggleBtn    = document.getElementsByClassName('more_'  +useParams.index)

        if(toggletarget[0].classList.contains('failure')){
            toggletarget[0].classList.remove('failure');
            toggletarget[0].classList.add('success');
            toggleBtn[0].textContent = '요약';
        }
        else{
            toggletarget[0].classList.remove('success');
            toggletarget[0].classList.add('failure');
            toggleBtn[0].textContent = '상세';
        }        
    }

    //선택된 모델 타입으로 클래스 리스트 호출
    const getSelectValue = async (modelNm, e) => {

        getFlowerGrwResult({modelNm : modelNm }, e)
	};

    //모델 리스트 호출
    const getModelList = async (params, e) => {

        let response = await axios({
            method: 'get',
            url: '/api/getModelList',
            params: {},
            headers: {
                'Content-Type' : 'multipart/form-data'
            },
        });

        let tempArr1 = [];
        let tempArr2 = [];
        let data = response.data.results
        
        for(var i = 0; i < data.length; i ++){
            tempArr1.push(data[i].model_nm);
            tempArr2.push(data[i].model_cate);
        }
        
        setModelCateList(tempArr1);
        setModelNmList(tempArr2);
    };

    useEffect(() => {
        getFlowerGrwResult('select');
        getModelList();
    },  []);
    
    //JSX식 작성
    return (
        <React.Fragment>
            <h1>모델 훈련 스케줄러 이력</h1>
            <div className="mx-1 my-3">
                {modelNmList.length != 0 && modelCateList.length != 0 &&
                   <SelectBox getSelectValue={getSelectValue} selectOption={modelNmList} selectValue={modelCateList} initOption={["훈련이력을 조회할 모델을 선택하세요."]}/>
                }
                <Table responsive bordered hover className="text-center">
                    <thead>
                    <tr>
                        <th>순번</th>
                        <th>모델명</th>
                        <th>데이터 다운</th>
                        <th>데이터 로드</th>
                        <th>모델 훈련</th>
                        <th>훈련일자</th>
                        <th>더보기/삭제</th>
                    </tr>
                    </thead>
                    <tbody>
                        {/* 반복문 */}
                        {list.map((num, index) => {
                            return <Cards list={num} index={index+1} key={index} />;
                        })}
                    </tbody>
                </Table>
                {list.length != 0 ? 
                    <div className="pagination_wrap">      
                        <ButtonGroup className="pagination">
                            <ToggleButton onClick={(e)=>{getFlowerGrwResult({ type : 'prev', docId : prev, docList : docList, prevTarget : prevTarget}, e)}} type="radio"variant={'outline-success'} name="radio"> &larr; 이전 </ToggleButton>
                            <ToggleButton onClick={(e)=>{getFlowerGrwResult({ type : 'next', docId : next, docList : docList, prevTarget : prevTarget}, e)}} type="radio"variant={'outline-primary'} name="radio"> 다음 &rarr; </ToggleButton>
                        </ButtonGroup>  
                    </div>
                : "" }
            </div>
        </React.Fragment>
    )

    function ClassList(props){
        let style = {padding : '5px'}
        return (
            <span style={style}>{props.list}</span>
        )
    }

    function Cards(props){

        let id = props.id;
        const url = '/view/detail/'+id

        return (   
            < >
                <tr>
                    <td>{ props.index }</td>
                    <td>{ props.list.model_nm }</td>
                    <td>{ props.list.down_status_summary }</td>
                    <td>{ props.list.load_status_summary }</td>
                    <td>{ props.list.training_status_summary }</td>
                    <td>{ props.list.reg_dt2}</td>
                    <td>
                        <div className='td_div_50'>
                            <Button variant="success" className={'more_'+props.index} onClick={(e)=>{showDetail({ 'index' : props.index}, e)}} >상세</Button>
                            <Button variant="danger" onClick={(e)=>{deleteClass({ callType : 'delete', targetId : props.list.id}, e)}} >삭제</Button>
                        </div>
                    </td>
                </tr>
                <tr className={'detail_' + props.index +' failure' }>
                    <td colSpan={7}>
                        <Table striped bordered className="text-center">
                            <tbody>
                                <tr>
                                    <th>이미지 다운</th>
                                    <td colSpan={3}>{ props.list.down_status }</td>
                                </tr>
                                <tr>
                                    <th>이미지 로드</th>
                                    <td colSpan={3} >{ props.list.load_status }</td>
                                </tr>
                                <tr>
                                    <th>모델 훈련</th>
                                    <td colSpan={3} >{ props.list.training_status }</td>
                                </tr>
                                <tr>
                                    <th>클래스 종류</th>
                                    <td colSpan={3}>
                                        {props.list.class_nm != null ? 
                                            props.list.class_nm.map((num, index) => {
                                                return <ClassList list={num} index={index+1} key={index} />;
                                            })
                                        : 
                                        <p> - </p>
                                        }
                                        
                                    </td>
                                </tr>
                                <tr>
                                    <th>모델 저장 경로</th>
                                    <td colSpan={3} >{ props.list.save_model_url }{ props.list.model_nm }.h5</td>
                                </tr>
                                <tr>
                                    <th>데이터셋 경로</th>
                                    <td colSpan={3} >{ props.list.dataset_url }</td>
                                </tr>
                                <tr>
                                    <th>훈련 그래프 저장경로</th>
                                    <td colSpan={3}>{props.list.result_img_path}</td>
                                </tr>
                                <tr >
                                    <th colSpan={2}>훈련시작</th>
                                    <th colSpan={2}>훈련종료</th>
                                </tr>
                                <tr >
                                    <td colSpan={2}>{ props.list.start_dt }</td>
                                    <td colSpan={2}>{ props.list.end_dt }</td>
                                </tr>
                                <tr >
                                    <th colSpan={2}>에포크</th>
                                    <th colSpan={2}>스탭</th>
                                </tr>
                                <tr >
                                    <td colSpan={2}>{ props.list.epochs }</td>
                                    <td colSpan={2}>{ props.list.steps }</td>
                                </tr>
                                <tr >
                                    <th>훈련 정확도</th>
                                    <th>훈련 손실</th>
                                    <th>검증 정확도</th>
                                    <th>검증 손실</th>
                                </tr>
                                <tr >
                                    <td>{ props.list.accuracy }</td>
                                    <td>{ props.list.loss }</td>
                                    <td>{ props.list.val_accuracy }</td>
                                    <td>{ props.list.val_loss }</td>
                                </tr>
                                <tr >
                                    <td colSpan={4} className='p-5' >
                                        <img src={'/api/getImgs?path='+props.list.result_img_path} alt={'이미지 없음'}/>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </td>
                </tr>
            </>
        )
    }
}

export default List 