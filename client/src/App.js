
import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Form, Button, FormControl } from 'react-bootstrap';

import axios from 'axios';

import ShoseDetail     from './view/shose/shoseDetail';
import ShoseList       from './view/shose/shoseList';
import MovieList       from './view/movie/movieList';
import MovieDetail     from './view/movie/movieDetail';
import FlowerAnalysis  from './view/flower/flowerAnalysis';
import AnimalAnalysis  from './view/flower/animalAnalysis';
import FlowerMngClass  from './view/flower/flowerMngClass';
import FlowerTrainHist from './view/flower/FlowerTrainHist';
import Openlayers      from './view/map/openlayers';
import Login           from './view/common/login';

import './assets/css/common.css';

import logo from './logo.svg';


/**
 * @author 메인 페이지 및 라우터 셋팅 컴포넌트
 * @returns 메인페이지 HTML 및 라우터 설정
**/
let currentPath = "";
function App() {

    let [isLogIn  , setIsLogIn ] = useState();
    let [authInfo , setAuchInfo] = useState();       

    const navigate = useNavigate();
    const location = useLocation();

    //사용자 권한 헨들링 함수
    const getAuthHandler = async (useParams, e) => {  
        let authType = useParams.authType
        
        let response = axios({
            method  : 'get',
            url     : '/api/userAuthority',
            params  : {
                authType : authType
            },
            headers : {
                'Content-Type' : 'multipart/form-data'
            }

        }).then(function(res){
            //권한 설정 및 부재시 로그인 페이지로 이동
            setIsLogIn(Boolean(res.data.isLogin))
            setAuchInfo(res.data.user)

            if (Boolean(res.data.isLogin) == false) {
                navigate("/" , {state : location.pathname});
            } 
        });
    }

    /*
        컴포넌트가 최초 랜더링 및 리랜더링 될 때 실행되는 HOOK (EFFECT, ARRAY, CLEAN-UP)
        1. EFFECT   : 마운트시 실행부
        2. ARRAY    : 최초마운트 실행 후 배열의 파라메터 값이 변경될때마다 실행 (배열을 []로 선언시 최초 1회만 실행)
        3. CLEAN-UP : EFFECT 실행전 어떠한 처리가 필요할경우나 이벤트가 바인딩 됨으로서 쌓일수 있는 메모리 누수를 막음 
        ※ 랜더링/리랜더링 -> 이전 EFFECT CLEAN-UP -> EFFECT 
    */
    useEffect(() => {
        //로그인 페이지를 제외한 사용자 권한 검증
        if(location.pathname != "/"){
            getAuthHandler({useParams : "verify"});
        }
        //같은 경로를 클릭 및 조회 할경우 새로고침 처리
        if(currentPath == location.pathname) {
            window.location.reload(); 
        }
        currentPath = location.pathname;

        //CLEAN-UP
        return () => {}
    }, [location]);
    
    return(
        <div>
            {isLogIn == true ? 
            <header>
                <Navbar bg="light" expand="lg" >
                    <Navbar.Brand href="/view/flower/flowerAnalysis">{' '}
                        <img alt="" src={logo} width="40" height="40" className="d-inline-block align-top mt-n1"/>Deep Learning World</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ml-auto">
                            {/* <Nav.Link href="/view/list">Shoes</Nav.Link> */}
                            <Nav.Link href="/view/movieList">Movie</Nav.Link>
                            <NavDropdown title="Flower" id="basic-nav-dropdown">
                                <NavDropdown.Item href="/view/flower/flowerAnalysis">flower Analysis</NavDropdown.Item>
                                <NavDropdown.Item href="/view/flower/animalAnalysis">animal Analysis</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/view/flower/flowerTrainHist">model Training schedules</NavDropdown.Item>
                                <NavDropdown.Item href="/view/flower/flowerMngClass">Add flowerClass</NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="Map" id="basic-nav-dropdown">
                                <NavDropdown.Item href="/view/map/openlayers">Open layers</NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="User" id="basic-nav-dropdown">
                                {isLogIn == true ? 
                                    <Form>
                                        <Form.Label className="mx-3 my-0 text-primary">{authInfo.email}</Form.Label>
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item href="/"  onClick={(e) => { getAuthHandler({authType : "logOut"}, e)}}>Log out</NavDropdown.Item>
                                    </Form>
                                : 
                                    <Form>
                                        <NavDropdown.Item href="/">Log in</NavDropdown.Item>
                                    </Form>
                                }
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                    <Form className="form1" >
                        <FormControl type="text" placeholder="검색어를 입력하세요." className="mr-sm-2" />
                        <Button variant="outline-success" >검색</Button>
                    </Form>
                </Navbar>
            </header>
            : "" }
            <div className="container pt-3">
                <Routes>
                    <Route path="/" element={<Login/> }></Route>
                    <Route path="/view/list/" element={ <ShoseList /> }></Route>
                    <Route path="/view/detail/:id" element={ <ShoseDetail/> }></Route>
                    <Route path="/view/movieList" element={ <MovieList/> } ></Route>
                    <Route path="/view/movieDetail/:id" element={ <MovieDetail/> } ></Route>
                    <Route path="/view/flower/flowerAnalysis" element={ <FlowerAnalysis/> } ></Route>
                    <Route path="/view/flower/animalAnalysis" element={ <AnimalAnalysis/> } ></Route>
                    <Route path="/view/flower/flowerMngClass" element={ <FlowerMngClass/> } ></Route>
                    <Route path="/view/flower/flowerTrainHist" element={ <FlowerTrainHist/> } ></Route>
                    <Route path="/view/map/openlayers" element={ <Openlayers/> } ></Route>
                </Routes>
            </div>
        </div>
    )
}

export default App;
