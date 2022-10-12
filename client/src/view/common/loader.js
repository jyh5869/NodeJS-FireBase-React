import ClipLoader from "react-spinners/ClipLoader";

/**
 * 로딩 스피너 표출 페이지
 * @returns
*/
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
