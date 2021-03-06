
import React from "react";
import {BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Form, Button, FormControl } from 'react-bootstrap';

import ProdList        from './view/prodList';
import Detail          from './view/detail';
import List            from './view/list';
import MovieDetail     from './view/movieDetail';
import FlowerAnalysis  from './view/flowerAnalysis';

import './assets/css/common.css';

import logo from './logo.svg';

function App() {

    return(
        <div>
            <header className="my-2">
                <Navbar bg="light" expand="lg" >
                    <Navbar.Brand href="#home">{' '}
                        <img alt=""src={logo} width="40" height="40" className="d-inline-block align-top mt-n1"/>React Bootstrap</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ml-auto">
                            <Nav.Link href="/view/list">Shoes</Nav.Link>
                            <Nav.Link href="/view/prodList">Movie</Nav.Link>
                            <Nav.Link href="/view/flowerAnalysis">flower</Nav.Link>
                            {/* 
                            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="#action/3.3">Separated link</NavDropdown.Item>
                            </NavDropdown> 
                            */}
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
                    <Route path="/" element={<ProdList/> }></Route>
                    <Route path="/view/list/" element={ <List /> }></Route>
                    <Route path="/view/detail/:id" element={ <Detail/> }></Route>
                    <Route path="/view/prodList" element={ <ProdList/> } ></Route>
                    <Route path="/view/movieDetail/:id" element={ <MovieDetail/> } ></Route>
                    <Route path="/view/flowerAnalysis" element={ <FlowerAnalysis/> } ></Route>
                </Routes>
            </div>
        </div>
    )
}
export default App; 
