import React, {useState} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Col, Button, Row, Container, Card, Form } from "react-bootstrap";

import axios from 'axios';


/**
 * @author 로그인 페이지 컴포넌트
 * @returns 로그인 페이지 HTML 
**/
const Login = (props) => {

    const navigate = useNavigate();
    const {state} = useLocation();

    const [authInfo, setAuthInfo] = useState({
        authType : "logIn",
        userId    : "",
        userPw    : "",
    });

    const onChangeAuthInfo = (e) => {
        setAuthInfo({
            ...authInfo,
            [e.target.name]: e.target.value,
        });
    };

    const handleLogin = async () => {
        
        let response = await axios({
            method  : 'get',
            url     : '/api/userAuthority',
            params  : {
                authType : authInfo.authType
                , userId : authInfo.userId
                , userPw : authInfo.userPw
            },
            headers : {
                'Content-Type' : 'multipart/form-data'
            }
        })

        if(response.data.user){
            if(state && state != "/") {
                navigate(state);
            } 
            else {
                navigate("/view/flower/flowerAnalysis");
            }
        }
        else {

        }
    };

    return (
        <Container>
            <Row className="vh-100 justify-content-center align-items-center">
            <Col lg={4} md={6} xs={10}>
                <Card>
                <Card.Body>
                    <div className="mb-3 mt-md-4">
                        <h2 className="fw-bold mb-2 text-center">로그인</h2>
                        <div className="mb-3">
                            <Form>
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Label>이메일</Form.Label>
                                    <Form.Control type="email" placeholder="Enter email" name="userId" onChange={(e) => { onChangeAuthInfo(e);}} />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicPassword">
                                    <Form.Label>비밀번호</Form.Label>
                                    <Form.Control type="password" placeholder="Password" name="userPw" onChange={(e) => { onChangeAuthInfo(e);}} />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicCheckbox">
                                    <p className="small">
                                        <a className="text-primary" href="#!">비밀번호를 잊으셨습니까?</a>
                                    </p>
                                </Form.Group>
                                <div className="d-grid">
                                    <Button variant="outline-success" onClick={handleLogin}>로그인</Button>
                                </div>
                            </Form>
                            <div className="mt-3">
                                <p className="mb-0 small text-center">아이디가 없으신가요?{" "}
                                    <a href="{''}" className="text-primary fw-bold">
                                        가입하기
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </Card.Body>
                </Card>
            </Col>
            </Row>
        </Container>
    );
};

export default Login;