
import React from "react";
import {BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Form, Button, FormControl } from 'react-bootstrap';


import ShoseDetail          from './view/shose/shoseDetail';
import ShoseList            from './view/shose/shoseList';
import MovieList       from './view/movie/movieList';
import MovieDetail     from './view/movie/movieDetail';
import FlowerAnalysis  from './view/flower/flowerAnalysis';
import FlowerMngClass  from './view/flower/flowerMngClass';
import FlowerTrainHist from './view/flower/FlowerTrainHist';

import './assets/css/common.css';

import logo from './logo.svg';

function App() {

    return(
        <div>
            <header>
                <Navbar bg="light" expand="lg" >
                    <Navbar.Brand href="#home">{' '}
                        <img alt=""src={logo} width="40" height="40" className="d-inline-block align-top mt-n1"/>React Bootstrap</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ml-auto">
                            {/* <Nav.Link href="/view/list">Shoes</Nav.Link> */}
                            <Nav.Link href="/view/movieList">Movie</Nav.Link>
                            <NavDropdown title="flower" id="basic-nav-dropdown">
                                <NavDropdown.Item href="/view/flower/flowerAnalysis">flower Analysis</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/view/flower/flowerTrainHist">model Training schedules</NavDropdown.Item>
                                <NavDropdown.Item href="/view/flower/flowerMngClass">Add flowerClass</NavDropdown.Item>
                            </NavDropdown> 
                        </Nav>
                    </Navbar.Collapse>
                    <Form className="form1" >
                        <FormControl type="text" placeholder="Search" className="mr-sm-2" />
                        <Button variant="outline-success" >Search</Button>
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
export default App; 
