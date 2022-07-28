import ClipLoader from "react-spinners/ClipLoader";

export default function Loader(props) {

    return (
        <>
            <div className={'loding-text'}  style={{display:props.loading===true?'block':'none'}}>분석중</div>
            <div className={'axios-loading'} style={{display:props.loading===true?'block':'none'}}>
                <div className={'axios-loading-indicator'}>
                    <ClipLoader color={props.color} loading={props.loading} size={150} />
                </div>
            </div>
        </>
   
   )
}