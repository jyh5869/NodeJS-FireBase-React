
import React, { useEffect, useState } from "react";
import {BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Form, Button, FormControl } from 'react-bootstrap';


import ShoseDetail     from './view/shose/shoseDetail';
import ShoseList       from './view/shose/shoseList';
import MovieList       from './view/movie/movieList';
import MovieDetail     from './view/movie/movieDetail';
import FlowerAnalysis  from './view/flower/flowerAnalysis';
import FlowerMngClass  from './view/flower/flowerMngClass';
import FlowerTrainHist from './view/flower/FlowerTrainHist';
import { authService } from './view/common/firebaseConfig';

import './assets/css/common.css';

import logo from './logo.svg';

import {
    createUserWithEmailAndPassword,
    getRedirectResult,
    GithubAuthProvider,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithRedirect,
    signOut,
  } from "firebase";
  

function App() {

    useEffect(() => {
        authService.onAuthStateChanged((user) => {
          if (user) {
            alert("로그인 되어있어");
            //setIsLoggedIn(true);
          } else {
            alert("로그인 안되어있어");
            //setLogout();
          }
        });
      }, []);
    
    return(
        <div>
            <header>
                <Navbar bg="light" expand="lg" >
                    <Navbar.Brand href="/view/flower/flowerAnalysis">{' '}
                        <img alt=""src={logo} width="40" height="40" className="d-inline-block align-top mt-n1"/>Deep Learning World</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ml-auto">
                            {/* <Nav.Link href="/view/list">Shoes</Nav.Link> */}
                            <Nav.Link href="/view/movieList">Movie</Nav.Link>
                            <NavDropdown title="Flower" id="basic-nav-dropdown">
                                <NavDropdown.Item href="/view/flower/flowerAnalysis">flower Analysis</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/view/flower/flowerTrainHist">model Training schedules</NavDropdown.Item>
                                <NavDropdown.Item href="/view/flower/flowerMngClass">Add flowerClass</NavDropdown.Item>
                            </NavDropdown> 
                        </Nav>
                    </Navbar.Collapse>
                    <Form className="form1" >
                        <FormControl type="text" placeholder="검색어를 입력하세요." className="mr-sm-2" />
                        <Button variant="outline-success" >검색</Button>
                    </Form>
                </Navbar>
            </header>
            <div className="container pt-3">
                <Routes>
                    <Route path="/" element={<FlowerAnalysis/> }></Route>
                    <Route path="/view/list/" element={ <ShoseList /> }></Route>
                    <Route path="/view/detail/:id" element={ <ShoseDetail/> }></Route>
                    <Route path="/view/movieList" element={ <MovieList/> } ></Route>
                    <Route path="/view/movieDetail/:id" element={ <MovieDetail/> } ></Route>
                    <Route path="/view/flower/flowerAnalysis" element={ <FlowerAnalysis/> } ></Route>
                    <Route path="/view/flower/flowerMngClass" element={ <FlowerMngClass/> } ></Route>
                    <Route path="/view/flower/flowerTrainHist" element={ <FlowerTrainHist/> } ></Route>
                </Routes>
            </div>
        </div>
    )
}


















//Email로 가입하는 함수
//동작이 이루어지면 앞서 작성한 로그인 상태 감지 함수로 인해 user정보가 변수에 저장되고 setState가 발생
export async function registerWithEamil(email, password) {
    try {
      await createUserWithEmailAndPassword(authService, email, password).then(
        (e) => {}
      );
    } catch (e) {
      return e.message.replace("Firebase: Error ", "");
    }
  }
  
  
  //Email로 로그인하는 함수
  export async function loginWithEamil(email, password) {
    try {
      await signInWithEmailAndPassword(authService, email, password);
    } catch (e) {
      return e.message.replace("Firebase: Error ", "");
    }
  }
  
  
  //Google, Github로 로그인하는 함수
  export async function loginWithSocial(provider) {
    if (provider === "google") {
      try {
        const provider = new GoogleAuthProvider();
        await new signInWithRedirect(authService, provider);
        const result = await getRedirectResult(authService);
        if (result) {
          // const user = result.user;
        }
        return;
      } catch (error) {
        return error;
      }
    } else if (provider === "github") {
      try {
        const provider = new GithubAuthProvider();
  
        await new signInWithRedirect(authService, provider);
        const result = await getRedirectResult(authService);
        if (result) {
          // const user = result.user;
        }
        return;
      } catch (error) {
        return error;
      }
    }
  }
  
  
  
  //Logout 하는 함수
  export async function logout() {
    await signOut(authService);
    return;
  }
export default App; 
