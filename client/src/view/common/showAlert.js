import React, { useState } from 'react';

import Alert from 'react-bootstrap/Alert';


/**
 * @author 토스트 창 표출 컴포넌트
 * @returns 토스트 HTML 
 * @param props.title     : 토스트 제목
 * @param props.message   : 토스트 메시지
 * @param props.showState : 토스트 활성화 여부 TRUE & FALSE
**/
export default function ShowAlert(props) {

    const toastTile = props.toastInfo.title
    const toastMsg  = props.toastInfo.message
    const showState = props.toastInfo.showState

    const showAlert_wrap = { position: "absolute", width: "100%", left :"0", right : "0", top : "25%"}
    const showAlert = { width: "fit-content", margin: "0 auto"}
    
    return (
        <div style={showAlert_wrap} >
            <Alert variant="info" show={showState} style={showAlert} dismissible>
                <Alert.Heading>{toastTile}</Alert.Heading>
                <p>{toastMsg}</p>
            </Alert>
        </div>
    );
}