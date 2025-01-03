import React, {useState} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Col, Button, Row, Container, Card, Form } from "react-bootstrap";

import axios from 'axios';


/**
 * @author 권한 검증 및 생성 컴포넌트
 * @returns 권한 검증 및 생성 페이지 HTML 
**/
const Login = () => {

    const navigate = useNavigate();
    const {state}  = useLocation();

    const [uiType    , setUiType  ] = useState("login")
    const [txtReg    , setTxtReg  ] = useState("아이디와 비밀번호를 입력해주세요.")
    const [txtLogIn  , setTxtLogIn] = useState("아이디와 비밀번호를 입력해주세요.")
    const [colReg    , setColReg  ] = useState("text-primary")
    const [colLogIn  , setColLogIn] = useState("text-primary")
    const [authInfo  , setAuthInfo] = useState({
        userId  : "",
        userPw  : "",
        userPw2 : "",
    });

    const onChangeAuthInfo = (e) => {
        setAuthInfo({
            ...authInfo,
            [e.target.name]: e.target.value,
        });

    };

     //권한 추가시 VALIDATION 검증
    const validationChk = (authType) => {
        if(authType == "signUp"){
            if(authInfo.userId == ""){
                setTxtReg("아이디를 입력해 주세요.");
                setColReg("text-danger")
                return false;
            }
            if(authInfo.userPw == ""){
                setTxtReg("비밀번호를 입력해 주세요.");
                setColReg("text-danger")
                return false;
            }
            if(authInfo.userPw2 == ""){
                setTxtReg("확인비밀번호를 입력해 주세요.");
                setColReg("text-danger")
                return false;
            }
            if (authInfo.userPw != authInfo.userPw2){
                setTxtReg("일치하는 비밀번호를 입력해 주세요.");
                setColReg("text-danger")
                return false;
            }  
        }
        else{
            if(authInfo.userId == ""){
                setTxtLogIn("아이디를 입력해 주세요.");
                setColLogIn("text-danger")
                return false;
            }
            if(authInfo.userPw == ""){
                setTxtLogIn("비밀번호를 입력해 주세요.");
                setColLogIn("text-danger")
                return false;
            }
        }
        return true;
    };
    
    //권한 검증 및 생성 헨들러
    const handleLogin = async (authType) => {

        //console.log()
        if(!validationChk(authType)) return

        let response = await axios({
            method  : 'get',
            url     : '/api/userAuthority',
            params  : {
                authType : authType
                , userId : authInfo.userId
                , userPw : authInfo.userPw
            },
            headers : {
                'Content-Type' : 'multipart/form-data'
            }
        });

        if(response.data.user){//권한 검증 후 리턴페이지 이동
            if(state && state != "/") {
                navigate(state);
            }
            else {
                navigate("/view/flower/flowerAnalysis");
            }
        }
        else {//실패시 경우에 따른 Action
            if(authType == "logIn"){
                setTxtLogIn("올바른 아이디와 비밀번호를 입력해 주세요.");
                setColLogIn("text-danger")
            }
            else if(authType == "signUp"){
                setTxtReg("이미 사용중인 아이디입니다.");
                setColReg("text-danger")
            }
        }
    };

    return (
        <Container>
            <Row className="vh-100 justify-content-center align-items-center">
            <Col lg={4} md={6} xs={10}>
                <Card>
                {uiType == "login" ? 
                <Card.Body className="card-login">
                    <div className="mb-3 mt-md-4">
                        <h2 className="fw-bold mb-2 text-center">로그인</h2>
                        <div className="mb-3">
                            <Form>
                                <Form.Group className="mb-3 text-md" controlId="loginEmail">
                                    <Form.Label className="mb-1">이메일</Form.Label>
                                    <Form.Control className="text-md" type="email" placeholder="Enter email" name="userId" onChange={(e) => { onChangeAuthInfo(e);}} />
                                </Form.Group>
                                <Form.Group className="mb-3 text-md" controlId="loginPassword">
                                    <Form.Label className="mb-1">비밀번호</Form.Label>
                                    <Form.Control className="text-md" type="password" placeholder="Password" name="userPw" onChange={(e) => { onChangeAuthInfo(e);}} />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicCheckbox">
                                    <p className="small">
                                        <span className={colLogIn}>{txtLogIn}</span>
                                    </p>
                                </Form.Group>
                                <div className="d-grid">
                                    <Button variant="outline-success" onClick={(e) => { handleLogin('logIn');}}>로그인</Button>
                                </div>
                            </Form>
                            <div className="mt-3">
                                <p className="mb-0 small text-center">아이디가 없으신가요?{" "}
                                    <button onClick={(e) => { setUiType('register');}}  className="text-primary fw-bold border-0 bg-white" >
                                        가입하기
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </Card.Body>
                :
                <Card.Body className="card-register">
                    <div className="mb-3 mt-md-4">
                        <h2 className="fw-bold mb-2 text-center">가입하기</h2>
                        <div className="mb-3">
                            <Form>
                                <Form.Group className="mb-3 text-md" controlId="regEmail">
                                    <Form.Label className="mb-1">이메일</Form.Label>
                                    <Form.Control type="email" className="text-md" placeholder="Enter email" name="userId"  onChange={(e) => { onChangeAuthInfo(e);}} />
                                </Form.Group>
                                <Form.Group className="mb-3 text-md" controlId="regPassword">
                                    <Form.Label className="mb-1">비밀번호</Form.Label>
                                    <Form.Control type="password" className="text-md" placeholder="Password" name="userPw"  onChange={(e) => { onChangeAuthInfo(e);}} />
                                </Form.Group>
                                <Form.Group className="mb-3 text-md" controlId="regPassword">
                                    <Form.Label className="mb-1">비밀번호 확인</Form.Label>
                                    <Form.Control type="password" className="text-md" placeholder="Password" name="userPw2"  onChange={(e) => { onChangeAuthInfo(e);}} />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="chkOverlap">
                                    <p className="small">
                                        <span className={colReg}>{txtReg}</span>
                                    </p>
                                </Form.Group>
                                <div className="d-grid">
                                    <Button variant="outline-success" onClick={(e) => { handleLogin('signUp');}}>가입하기</Button>
                                </div>
                            </Form>
                            <div className="mt-3">
                                <p className="mb-0 small text-center">아이디가 있으신가요?{" "}
                                    <button  onClick={(e) => { setUiType('login');}} className="text-primary fw-bold border-0 bg-white">
                                        로그인하기
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </Card.Body>
                }
                </Card>
            </Col>
            </Row>
        </Container>
    );
};

export default Login;