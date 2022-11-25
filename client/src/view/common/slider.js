import React, { useEffect, useState } from 'react';
import { Image } from 'react-bootstrap';

import Carousel from 'react-bootstrap/Carousel';


/**
 * @author 이미지 슬라이더 표출 컴포넌트
 * @returns 이미지 슬라이더 HTML 
 * @param props.sliderImgArr : 슬릭 이미지경로 배열
 * @param props.sliderTitArr : 슬릭 콘텐츠 (제목)
 * @param props.sliderSubArr : 슬릭 콘텐츠 (내용)
**/
function Slider(props) {

    let [sliderImgArr, setSliderImgArr] = useState([]);
    let [sliderTitArr, setSliderTitArr] = useState([]);
    let [sliderSubArr, setSliderSubArr] = useState([]);
    
    const imgArr= props.sliderImgArr

    useEffect(() => {
        setSliderImgArr(props.sliderImgArr)
        setSliderTitArr(props.sliderTitArr)
        setSliderSubArr(props.sliderSubArr)
    },  []);

    return (
        <div className='slider_wrap'>
            <Carousel fade>
                {sliderImgArr.map((list, index) => (
                    <Carousel.Item key={ index }>
                        <Image
                            className="d-block slideImg"
                            src={ sliderImgArr[index] }
                            alt="First slide"
                        />
                        <Carousel.Caption>
                            <h3>{ sliderTitArr[index] }</h3>
                            <p>{ sliderSubArr[index] }</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                ))}
            </Carousel>
        </div>
    );
}

export default Slider;