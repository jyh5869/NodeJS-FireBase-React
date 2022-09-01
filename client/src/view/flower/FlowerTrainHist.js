
import React,  {useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardGroup, Table, Form, Button } from 'react-bootstrap';
import axios               from 'axios';

//import { name1, name2 } from './data';
import Data from '../../data';


function List() {

    let [shoes, shoeState] = useState(Data);
    let [list, setList]    = useState([])

    const getFlowerGrwResult = async (callType) => {

        let response = await axios({
            method: 'get',
            url: '/api/getTrainingHist',
            params: {'callType' : callType},
            headers: {
              'Content-Type': 'multipart/form-data',
            },
        })
        var datas =  response.data.rows
        
        setList(datas)
    }


    const deleteClass = async (useParams, e) => {

        let flag  = window.confirm('해당 클래스를 분류 클래스에서 제외하시겠습니까\n익일 AM 1:00에 제외된 채로 색인 되어 모델에 적용됩니다.');
        console.log(useParams.targetId)
        
        if(flag){

            let response = await axios({
                method: 'get',
                url: '/api/flwNewClass',
                params: {
                    callType   : useParams.callType
                    , targetId : useParams.targetId
                },
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            //console.log(response.data.results);
            getFlowerGrwResult('select');
        }
        
    };


    useEffect(() => {
        getFlowerGrwResult('select');
    },  []);

    return (
        
        <div className="row">
            <h1>분류 가능 클래스 </h1>
            <Table striped bordered hover className="text-center">

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
        </div>
    )

    function Cards(props){

        let id = props.id;
        const url = '/view/detail/'+id
        
        return (   
            <>
                <tr>
                    <td>{ props.index }</td>
                    <td>{ props.list.model_nm }</td>
                    <td>{ props.list.down_status_summary }</td>
                    <td>{ props.list.load_status_summary }</td>
                    <td>{ props.list.training_status_summary }</td>
                    <td>{ props.list.reg_dt1 }</td>
                    <td>
                        <div className='td_div_50'>
                            <Button variant="success" onClick={(e)=>{deleteClass({ callType : 'delete', targetId : props.list.id}, e)}} >More</Button>
                        </div>
                        <div className='td_div_50'>
                            <Button variant="danger" onClick={(e)=>{deleteClass({ callType : 'delete', targetId : props.list.id}, e)}} >Delete</Button>
                        </div>
                    </td>
                </tr>
                <tr >
                    <td colSpan={7}>
                        <div>이미지 다운 : { props.list.down_status }</div>
                        <div>이미지 로드 : { props.list.load_status }</div>
                        <div>모델 훈련 : { props.list.training_status }</div>
                        <div>클래스 종류 : { props.list.class_nm }</div>
                        <div>에포크 : { props.list.epochs } / 스탭 : { props.list.steps } / 출력상탱 : { props.list.verbose }</div>
                        <div>훈련 정확도 : { props.list.accuracy } / 훈련 손실 : { props.list.loss } / 검증 정확도 : { props.list.accuracy } / 검증 손실 : { props.list.val_loss }</div>
                        <img src={'/api/getImgs?path='+props.list.result_img_path} alt={'이미지 없음'}/>
                    </td>
                </tr>
            </>
        )
    }
}

export default List 