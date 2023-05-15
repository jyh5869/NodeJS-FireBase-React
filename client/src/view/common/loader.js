import React, { useEffect, useState } from "react";
import { Audio, Oval, BallTriangle, Rings, TailSpin, Hearts } from 'react-loader-spinner'

// https://mhnpd.github.io/react-loader-spinner/docs/category/components/
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
    console.log(props);
    return (
        <div className={'loading_wrap'}>
            <div className={'loding-text-'+ props.type}  style={{display:props.text != "" && props.loading === true ? 'block' : 'none'}}>{props.text}</div>
            <div className={'axios-loading'} style={{display:props.loading === true ? 'block' : 'none'}}>

                    <Oval 
                        height={size}
                        width={size}
                        radius={9}
                        color={props.color == "" ? "#4fa94d" : props.color}
                        secondaryColor={props.secondaryColor == "" ? "#4fa94d" : props.secondaryColor}
                        ariaLabel="oval-loading"
                        wrapperStyle={{}}// CSS 적용 가능
                        wrapperClass=""// 스타일 테그 적용가능
                        visible={props.type == "Oval" ? true : false}// 보여줄 로딩바 타입에 따른 표출              
                        strokeWidth={2} // 스피너 두께
                        strokeWidthSecondary={2}// 회전 주기
                    />

                    <BallTriangle
                        height={size}
                        width={size}
                        radius={6}
                        color={props.color == "" ? "#4fa94d" : props.color}
                        ariaLabel="ball-triangle-loading"
                        wrapperClass={{}}
                        wrapperStyle=""
                        visible={props.type == "BallTriangle" ? true : false}
                    />

                    <Audio
                        height={size}
                        width={size}
                        color={props.color == "" ? "#4fa94d" : props.color}
                        ariaLabel="audio-loading"
                        wrapperStyle={{}}
                        wrapperClass="wrapper-class"
                        visible={props.type == "Audio" ? true : false}
                    />

                    <Rings
                        height={size}
                        width={size}
                        color="#4fa94d"
                        radius="6"
                        ariaLabel="rings-loading"
                        wrapperStyle={{}}
                        wrapperClass=""
                        visible={props.type == "Rings" ? true : false}
                    />

                    <TailSpin
                        height={size}
                        width={size}
                        color={props.color == "" ? "#4fa94d" : props.color}
                        ariaLabel="tail-spin-loading"
                        radius="1"
                        wrapperStyle={{}}
                        wrapperClass=""
                        visible={props.type == "TailSpin" ? true : false}
                    />

                    <Hearts 
                        height={size}
                        width={size}
                        color={props.color == "" ? "#4fa94d" : props.color}
                        ariaLabel="hearts-loading"
                        wrapperStyle={{}}
                        wrapperClass=""
                        visible={props.type == "Hearts" ? true : false}
                    />


            </div>
        </div>
   )
}
