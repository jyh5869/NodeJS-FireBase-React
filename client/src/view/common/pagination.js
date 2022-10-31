
/**
 * @author 공통 페이징 처리 함수
 * @returns 받은 파라메터를 그대로 [prevDoc, nextDoc, docList, prevTarget]
 * @param data
 * @param type
 * @param docList
 * @param prevTarget 
*/
export default function Pagination (data, type, docList, prevTarget ) {

    let prevDoc;
    let nextDoc;
    
    ;

    //이전 페이지를 호출 할 경우
    if(type == "prev"){
        prevTarget++//이전페이지 카운트 증가

        //첫페이지에서 이전 페이지 호출(이전페이지 카운트가 저장 리스트의 길이와 같을 경우)
        if(prevTarget == docList.length - 1 ){
            prevTarget--//이전페이지 카운트 감소(이후 이전 페이지 호출시에도 첫페이지를 호출 하기 위함)
        }

    }//다음 페이지를 호출 할 경우
    else if(type == "next" || type == ""){
        docList.push(data[0].doc_id)//호출한 페이지의 문서 아이디값 추가

        //배열 중복 제거(만약 다음 페이지가 이전페이지 호출등의 이유로 이미 호출 했을 경우 배열에 쌓지 않기 위함)
        const set1 = new Set(docList);
        docList = [...set1];

        if(prevTarget != 0 ) {//첫페이지가 아닐 경우
            prevTarget-- //이전페이지 카운트 감소
        }
    }
    //다음페이지 눌렸을때 게시물 수가 countPerPage 이하힐때 마지막페이지로 간주
    if(type == "next" && data.length < 10){  
        nextDoc = data[0].doc_id
        prevDoc = type == "" ? docList[0] : docList[docList.length - (prevTarget + 2)]
    }
    else{//마지막 페이지가 아닐때
        nextDoc = data[Number(data.length-1)].doc_id
        prevDoc = type == "" ? docList[0] : docList[docList.length - (prevTarget + 2)]
    }

    console.log(data);
    console.log(type);
    console.log(docList);
    console.log(prevTarget)
    console.log(nextDoc)
    console.log(prevDoc)
    let pagingArr = [prevDoc, nextDoc, docList, prevTarget]

    return pagingArr;

}
