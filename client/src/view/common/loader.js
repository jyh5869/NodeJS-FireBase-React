import React, { useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";


/**
 * @author 로딩 스피너 호출 컴포넌트
 * @returns 로딩 스피너 HTML 
 * @param props.loading : 로딩스피너 활성화 여부
 * @param props.type    : 스피너 굵기
 * @param props.size    : 스피너 크기
 * @param props.color   : 스피너 색깔
**/
export default function Loader(props) {

    let size = props.size != null ? props.size : 150 ;
    //alert(props.text)
    return (
        <div className={'loading_wrap'}>
            <div className={'loding-text-'+ props.type}  style={{display:props.text != "" && props.loading === true ? 'block' : 'none'}}>{props.text}</div>
            <div className={'axios-loading-'+ props.type} style={{display:props.loading === true ? 'block' : 'none'}}>
                <div className={'axios-loading-indicator-'+ props.type}>
                    <ClipLoader className={"loadingbar-"+ props.type} color={props.color} loading={props.loading} size={size} />
                </div>
            </div>
        </div>
   )
}
