

import axios from 'axios';
import {useEffect} from "react";
import './App.css';

function App() {
 
    const callApi = async () => {
        axios.get("/api").then((res) => 
            console.log(res.data.rows)
        );
    };

    useEffect(() => {
      callApi();
    }, []);

    return <div>테스트 입니다. </div>;
}

export default App;
