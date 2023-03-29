import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';

const options = [
  {
    name: 'Enable backdrop (default)',
    scroll: false,
    backdrop: true,
  },
  {
    name: 'Disable backdrop',
    scroll: false,
    backdrop: false,
  },
  {
    name: 'Enable body scrolling',
    scroll: true,
    backdrop: false,
  },
  {
    name: 'Enable both scrolling & backdrop',
    scroll: true,
    backdrop: true,
  },
  {
    name: 'Sample Button',
    scroll: true,
    backdrop: true,
  },
];

function OffCanvasExample(props) {
  console.log("☆☆☆☆☆☆☆☆☆☆☆☆☆" + props.canvasIdx);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const toggleShow = () => setShow((s) => !s);


  let selectedIdx  = Number(props.canvasIdx);
  let name = options[selectedIdx].name;
  let scroll = options[selectedIdx].scroll;
  let backdrop = options[selectedIdx].backdrop;

  return (
    <>
      <Button variant="primary" onClick={toggleShow} className="me-2">
        {name}
      </Button>
      <Offcanvas show={show} onHide={handleClose} scroll={scroll} backdrop={backdrop}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Offcanvas</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          Some text as placeholder. In real life you can have the elements you
          have chosen. Like, text, images, lists, etc.
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

function Example(props) {

    let [canvasIdx  , setCanvasIdx  ] = useState([]);

    useEffect(() => {
      setCanvasIdx(props.canvasIdx)
    },  []);

  return (
    <>
      <OffCanvasExample canvasIdx={canvasIdx} />
    </>
  );
}

export default Example;