
import React,  {useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardGroup, Table, Form, Button } from 'react-bootstrap';
import axios               from 'axios';

//import { name1, name2 } from './data';
import Data from '../../data';


function List() {

    let [shoes, shoeState] = useState(Data);
    let [list, setList]    = useState([])
    
    const OPTIONS = [
        { value: "Y", name: "활성화" },
        { value: "N", name: "비활성화" },
    ];

    const getFlowerGrwResult = async (callType) => {

        let response = await axios({
            method: 'get',
            url: '/api/flwNewClass',
            params: {'callType' : callType},
            headers: {
              'Content-Type': 'multipart/form-data',
            },
        })
        var datas =  response.data.rows
        
        setList(datas)
    }

    const SelectBox = (props) => {

        const modifyAction = async  (params, e) => {

            let response = await axios({
                method: 'get',
                url: params.targetUrl,
                params: {
                    'callType'    : params.callType
                    , 'targetId'  : params.targetId
                    , 'targetVal' : e.target.value
                
                },
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
            });
            //console.log(response.data.results);
            e.target.value = e.target.value
        };
    
        return (
            <Form.Select key={props.useParams.targetId} onChange={(e)=>{modifyAction({ callType : props.useParams.callType, targetUrl : props.targetUrl, targetId : props.useParams.targetId}, e)}} defaultValue={props.defaultValue}>
                {props.options.map((option) => (
                    <option 
                        key= {option.value}
                        value={option.value}
                    >
                        {option.name}
                    </option>
                ))}
            </Form.Select>
        );
    };

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
                    <th>클래스명(국문)</th>
                    <th>클래스명(영문)</th>
                    <th>등록 날짜</th>
                    <th>사용여부</th>
                    <th>훈련 가능여부</th>
                    <th>삭제</th>
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
            <tr>
                <td>{ props.index }</td>
                <td>{ props.list.model_nm }</td>
                <td>{ props.list.class_kor_nm }</td>
                <td>{ props.list.class_eng_nm }</td>
                <td>{ props.list.reg_dt }</td>
                <td>
                    <SelectBox  options={OPTIONS} defaultValue={ props.list.use_yn } onChangeEvent={'modifyClass'} targetUrl={'/api/flwNewClass'} useParams={{ callType : 'modify', targetId : props.list.id}}></SelectBox>
                </td>
                <td>
                    <div className='td_div_50'>
                        {/* { props.list.newRegYn } */} 
                        { props.list.newtrainYn }   
                    </div>
                </td>
                <td>
                    <div className='td_div_50'>
                        <Button variant="success" onClick={(e)=>{deleteClass({ callType : 'delete', targetId : props.list.id}, e)}} >Delete</Button>
                    </div>
                </td>
            </tr> 
        )
    }
}

export default List 