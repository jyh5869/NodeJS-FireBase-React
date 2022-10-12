import ClipLoader from "react-spinners/ClipLoader";

/**
 * 로딩 스피너 표출 페이지
 * @returns
*/
export default function Loader(props) {

    let size = props.size != null ? props.size : 150 ;

    return (
        <div className={'loading_wrap'}>
            <div className={'loding-text-' + props.type}  style={{display:props.loading===true?'block':'none'}}>{props.text}</div>
            <div className={'axios-loading-' + props.type} style={{display:props.loading===true?'block':'none'}}>
                <div className={'axios-loading-indicator-' + props.type}>
                    <ClipLoader color={props.color} loading={props.loading} size={size} style={{borderWidth:props.borderWidth != null? props.borderWidth:"2px"}} />
                </div>
            </div>
        </div>
   )
}