import React,  {useEffect, useState } from 'react';
import Carousel  from 'react-bootstrap/Carousel';
import { Image } from 'react-bootstrap';

/**
 * 이미지 슬라이더 표출 페이지
 * @returns
*/
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
        <div>
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