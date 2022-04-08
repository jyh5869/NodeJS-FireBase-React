

import axios from 'axios';
import React, { useEffect, useState } from "react";

function ProdList() {

    const [list, setList] = useState([]);

    const getHeroes = async () => {

        let response = await axios.get('/api');
        console.log(response.data.rows);
        setList(response.data.rows);
    }

    useEffect(() => {
        getHeroes();
    },  []);

    //JSX 식으로 리스트 파싱
    return (
        <div>
            <h1>Our new Products</h1>
            <div>               
                <div class="products">
                    {list.map(list => (
                    <a href="#">            
                        <img src="https://og-data.s3.amazonaws.com/media/artworks/half/A0880/A0880-0016.jpg" alt=""/>
                        <p>{list.brdtitle}</p>
                        <p class="price">{list.brdno}</p>
                    </a>
                    ))}
                </div>                
            </div>
        </div>
    )
}

export default ProdList;