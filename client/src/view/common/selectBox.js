import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';


/**
 * @author 셀렉트박스 컴포넌트
 * @returns 셀렉트박스 HTML 
 * @param props.selectOption : 셀렉트박스 옵션   (배열)
 * @param props.selectValue  : 셀렉트박스 벨류   (배열)
 * @param props.initOption   : 셀렉트박스 초기값 (텍스트)
**/
function SelectBox(props) {
    
    let [selectOption  , setSelectOption  ] = useState([]);
    let [selectValue   , setSelectValue   ] = useState([]);
    let [initOption    , setInitOption    ] = useState([]);

    const handleSelectChange = (e) => {
        props.getSelectValue(e.target.value);
	};
    
    useEffect(() => {
        setSelectOption(props.selectOption)
        setSelectValue(props.selectValue)
        setInitOption(props.initOption)
    },  []);

    return (
        <Form.Select aria-label="Default select example" onChange={handleSelectChange}>
            <option>{initOption}</option>
            {selectOption.map((list, index) => (
                <option key={index} value={selectValue[index]} >{list}</option>
            ))}
        </Form.Select>
    );
}

export default SelectBox;