import React, { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

export default function ShowAlert(props) {

   //alert("하이하이" + props.showAlert);
   const msg = props.msg
   //const [show, setShow] = useState(props.showAlert);
   //onClose={() => setToastStatus(false)}
   //if (flag ) {
     return (
       <Alert variant="info"  dismissible>
         <Alert.Heading>성공!</Alert.Heading>
         <p>
           클래스 추가가 완료 되었습니다.
         </p>
       </Alert>
     );
   //}
   //return null;
}

