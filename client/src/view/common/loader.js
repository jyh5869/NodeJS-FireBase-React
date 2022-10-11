import ClipLoader from "react-spinners/ClipLoader";

/**
 * 로딩 스피너 표출 페이지
 * @returns
*/
export default function Loader(props) {

    return (
        <div className={'loading_wrap'}>
            <div className={'loding-text'}  style={{display:props.loading===true?'block':'none'}}>분석중</div>
            <div className={'axios-loading'} style={{display:props.loading===true?'block':'none'}}>
                <div className={'axios-loading-indicator'}>
                    <ClipLoader color={props.color} loading={props.loading} size={150} />
                </div>
            </div>
        </div>
   )
}