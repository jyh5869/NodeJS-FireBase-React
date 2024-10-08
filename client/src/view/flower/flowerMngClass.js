import React,  { useEffect, useState } from 'react';
import { Modal, Table, Form, Button, ToggleButton, ButtonGroup } from 'react-bootstrap';

import axios from 'axios';

import ShowAlert  from '../common/showAlert';
import Pagination from '../common/pagination';
import SelectBox  from '../common/selectBox';


/**
 * @author 분석가능 클레스 리스트 컴포넌트
 * @returns 분석가능 클래스 리스트 HTML
**/
function FlowerMngClass() {

    const [list, setList]    = useState([]);
    const [docList   , setDocList   ] = useState();
    const [prevTarget, setPrevTarget] = useState("");
    const [next      , setNext      ] = useState("");
    const [prev      , setPrev      ] = useState("");
    const [modelNm   , setModelNm   ] = useState("");

    const [modelCateList, setModelCateList] = useState([]);
    const [modelNmList  , setModelNmList  ] = useState([]);

    const [toastStatus, setToastStatus] = useState(false);
    const [toastInfo  , setToastInfo  ] = useState({
        title     : "",
        message   : "",
        showState : false,
    }); // 토스트 정보

    const handleToast = (title, message, showState) => {
        setToastStatus(true);
        setToastInfo({
            ...toastInfo,
            title     : title,
            message   : message,
            showState : showState,
        });
    };

    //모델 클래스 리스트 호출 
    const getFlowerGrwResult = async (useParams, e) => {

        let type       = useParams.type;       
        let docList    = useParams.docList;   
        let prevTarget = useParams.prevTarget; 
        let docId      = useParams.docId;
        let modelNm    = useParams.modelNm;

        let response = await axios({
            method: 'get',
            url: '/api/flwNewClass',
            params: {
                'callType' : 'select',
                'docId'    : docId ,
                'type'     : type ,
                'modelNm'  : modelNm,
            },
            headers: {
              'Content-Type': 'multipart/form-data'
            },
        })

        var pagingArr = Pagination(response.data.rows, type, docList, prevTarget);

        setPrev(pagingArr[0])
        setNext(pagingArr[1])
        setDocList(pagingArr[2])
        setPrevTarget(pagingArr[3])
        setList(pagingArr[4]);
        setModelNm(modelNm);
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

    return (
        <React.Fragment>
            <h1>분류 가능 클래스 </h1>
            <div className="mx-1 my-3">
                <AddClass status={'open'} loading={true} />
                {modelNmList.length != 0 && modelCateList.length != 0 &&
                   <SelectBox getSelectValue={getSelectValue} selectOption={modelNmList} selectValue={modelCateList} initOption={["클래스를 조회할 모델을 선택하세요."]}/>
                }
                <ShowAlert toastInfo={toastInfo}/>
                <Table striped bordered hover responsive  className="text-center px-1" >
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
                        {list.map((num, index) => {
                            return <SetClassList list={num} index={index+1} key={index} />;
                        })}
                    </tbody>
                </Table>
                {list.length != 0 ? 
                    <div className="pagination_wrap">      
                        <ButtonGroup className="pagination">
                            <ToggleButton onClick={(e)=>{getFlowerGrwResult({ type : 'prev', docId : prev, docList : docList, prevTarget : prevTarget, modelNm : modelNm}, e)}} type="radio"variant={'outline-success'} name="radio"> &larr; 이전 </ToggleButton>
                            <ToggleButton onClick={(e)=>{getFlowerGrwResult({ type : 'next', docId : next, docList : docList, prevTarget : prevTarget, modelNm : modelNm}, e)}} type="radio"variant={'outline-primary'} name="radio"> 다음 &rarr; </ToggleButton>
                        </ButtonGroup>  
                    </div>
                : "" }
            </div>
        </React.Fragment>
    )

    
    function SetClassList(props){

        let id = props.id;
        const url = '/view/detail/'+id
        
        const OPTIONS = [
            { value: "Y", name: "활성화" },
            { value: "N", name: "비활성화" },
        ];
    
        const SelectBox = (props) => {
    
            const modifyAction = async  (params, e) => {

                let response = await axios({
                    method: 'get',
                    url: params.targetUrl,
                    params: {
                        'callType'  : params.callType,
                        'targetId'  : params.targetId,
                        'targetVal' : e.target.value
                    },
                    headers: {
                        'Content-Type' : 'multipart/form-data'
                    },
                });

                e.target.value = e.target.value
            };
        
            return (
                <Form.Select key={props.useParams.targetId} onChange={(e)=>{modifyAction({ callType : props.useParams.callType, targetUrl : props.targetUrl, targetId : props.useParams.targetId}, e)}} defaultValue={props.defaultValue}>
                    {props.options.map((option) => (
                        <option 
                            key  = {option.value}
                            value= {option.value}
                        >
                            {option.name}
                        </option>
                    ))}
                </Form.Select>
            );
        };
    
        const deleteClass = async (useParams, e) => {

            let flag  = window.confirm('해당 클래스를 분류 클래스에서 제외하시겠습니까\n익일 AM 1:00에 제외된 채로 색인 되어 모델에 적용됩니다.');

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

                //삭제 후 리스트 재호출
                getFlowerGrwResult({modelNm : modelNm }, e)
            }
        };
    
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
                        { props.list.newtrainYn }   
                    </div>
                </td>
                <td>
                    <div className='td_div_50'>
                        <Button variant="success" onClick={(e)=>{deleteClass({ callType : 'delete', targetId : props.list.id}, e)}} >삭제</Button>
                    </div>
                </td>
            </tr> 
        )
    }


    function AddClass(props) {

        const [show, setShow] = useState(false);
    
        const handleClose = () => setShow(false);
        const handleShow  = () => setShow(true);
        
        const [classInfo, setClassInfo] = useState({
            callType : "insert",
            korNm    : "",
            engNm    : "",
            modelNm  : "",
        });
    
        const onChangeClassInfo = (e) => {
            setClassInfo({
                ...classInfo,
                [e.target.name]: e.target.value,
            });
        };
    
        const addClassActon = async (useParams, e) => {
            
            if(classInfo.modelNm == ""){alert("클래스를 추가할 모델을 선택하세요."   ); return}
            if(classInfo.korNm   == ""){alert("추가할 클래스의 한글명을 입력하세요." ); return}
            if(classInfo.engNm   == ""){alert("추가할 클래스의 영문명을 입력하세요." ); return}

            let flag  = window.confirm('해당 분류 모델에 새 클래스를 추가 하시겠습니까?\n익일 AM 1:00에 제외된 채로 색인 되어 모델에 적용됩니다.');
            
            if(flag){
                let response = await axios({
                    method: 'get',
                    url: '/api/flwNewClass',
                    params: {
                        callType : classInfo.callType,
                        modelNm  : classInfo.modelNm,
                        korNm    : classInfo.korNm,
                        engNm    : classInfo.engNm
                    },
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                
                setShow(false)//클래스 추가 창 닫기

                getFlowerGrwResult({modelNm : modelNm }, e)

                setTimeout(() => { handleToast("성공", "클래스 추가가 정상적으로 완료 되었습니다.", true)} , 0);   //토스트 호출
                setTimeout(() => { handleToast("성공", "클래스 추가가 정상적으로 완료 되었습니다.", false)}, 2500);//토스트 숨김
            }
        };
    
        return (
        <>
            <Button variant="success" className='btn_type1' onClick={handleShow}>클래스 추가</Button>      
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>클래스 추가하기</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label>모델명</Form.Label>
                            <Form.Select defaultValue={""} name='modelNm' onChange={onChangeClassInfo}>
                                    <option key= {'0'} vlaue="">모델을 선택하세요.</option>
                                    <option key= {'1'} value={'model_flw'}>
                                        {'Flower'}
                                    </option>
                                    <option key= {'2'} value={'model_animal'}>
                                        {'Animal'}
                                    </option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3"  controlId="exampleForm.ControlInput1">
                            <Form.Label>클래스 한글명</Form.Label>
                            <Form.Control type="text" name='korNm' placeholder="장미" autoFocus onChange={onChangeClassInfo}/>
                        </Form.Group>
                        <Form.Group className="mb-3"  controlId="exampleForm.ControlInput2">
                            <Form.Label>클래스 영문명</Form.Label>
                            <Form.Control type="text" name='engNm' placeholder="Rose" autoFocus onChange={onChangeClassInfo}/>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        취소하기
                    </Button>
                    <Button variant="success" onClick={addClassActon}>
                        추가하기
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
        )
    }
}

export default FlowerMngClass 