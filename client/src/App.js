

import axios from 'axios';
import React, { useEffect, useState } from "react";
import './App.css';
import './assets/css/market.css';


function App() {

    const [list, setList] = useState([]);

    const getHeroes = async () => {
        let response = await axios.get('/api');

        setList(response.data.rows);
    }


    useEffect(() => {
        getHeroes();
    }, []);

    return (
        <div>
            <h1>Our new Products</h1>
                <div class="products">
                {list.map(list => (
                <a href="#">
                    <img src={list.photo} alt={list.name}/>
                    <p>{list.brdtitle}</p>
                    <p class="price">{list.brdno}</p>
                </a>
                ))}
            </div>
        </div>
    )
}
export default App;