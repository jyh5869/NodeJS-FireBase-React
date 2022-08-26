
import React,  {useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardGroup, Table, Form } from 'react-bootstrap';
import axios               from 'axios';

//import { name1, name2 } from './data';
import Data from '../../data';

function List() {

    let [shoes, shoeState] = useState(Data);
    let [list, setList]    = useState([])
    
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

    useEffect(() => {
        getFlowerGrwResult('select');
    },  []);

    return (
        
        <div className="row">
            <h1>분류 가능 클래스 </h1>
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>순번</th>
                    <th>모델명</th>
                    <th>클래스명(국문)</th>
                    <th>클래스명(영문)</th>
                    <th>등록 날짜</th>
                    <th>사용여부</th>
                    <th>새클래스/새트레이닝</th>
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
        console.log(props)
        let id = props.id;
        const url = '/view/detail/'+id
        
        return (   
            <tr>
                <td>{ props.index }</td>
                <td>{ props.list.model_nm }</td>
                <td>{ props.list.class_kor_nm }</td>
                <td>{ props.list.class_eng_nm }</td>
                <td>{ props.list.reg_dt }</td>
                <td>{ props.list.use_yn }
                <Form.Select>
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                </Form.Select>
                </td>
                <td>{ props.list.newRegYn } / { props.list.newtrainYn }</td>
            </tr> 
        )
    }
}

export default List 