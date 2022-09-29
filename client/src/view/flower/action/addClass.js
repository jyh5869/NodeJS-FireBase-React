
import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import axios               from 'axios';
export default function AddClass(props) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
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
        console.log(classInfo)
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
        }
    };

    return (
        <>
      <Button variant="success" onClick={handleShow}>
      클래스 추가
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>클래스 추가하기</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>모델명</Form.Label>
              <Form.Select defaultValue={'model_flw'} name='modelNm' onChange={onChangeClassInfo}>
                    <option 
                        key= {'0'}
                        value={'model_flw'}
                    >
                        {'flower'}
                    </option>
                    <option 
                        key= {'1'}
                        value={'model_flw'}
                    >
                        {'animal'}
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