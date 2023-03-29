import React, { useEffect, useState } from 'react';
import { Button, Offcanvas }   from 'react-bootstrap';


const options = [
    {
        name: '모델 설명',
        title : '꽃 종류 분석 모델 가이드',
        contents : '꽃 종류 분석 모델 콘텐츠 입니다.</br>사용방법은 아래와 같습니다.',
        scroll: true,
        backdrop: true,
    },
];

function MakeOffCanvas(props) {

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const toggleShow = () => setShow((s) => !s);

    let selectedIdx  = Number(props.canvasIdx);
    let name = options[selectedIdx].name;
    let title = options[selectedIdx].title;
    let contents = options[selectedIdx].contents;
    let scroll = options[selectedIdx].scroll;
    let backdrop = options[selectedIdx].backdrop;
  
    return (
        <>
            <Button variant="outline-primary" onClick={toggleShow} className="offCanvas right me-2">
                {name}
            </Button>
            <Offcanvas show={show} onHide={handleClose} scroll={scroll} backdrop={backdrop}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{title}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body >
                    <div dangerouslySetInnerHTML={ {__html: contents} }></div>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}

function OffCanvas(props) {

    let [canvasIdx  , setCanvasIdx  ] = useState([]);

    useEffect(() => {
        setCanvasIdx(props.canvasIdx)
    },  []);

    return (
        <>
            <MakeOffCanvas canvasIdx={canvasIdx} />
        </>
    );
}

export default OffCanvas;