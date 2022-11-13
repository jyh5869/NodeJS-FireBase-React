/**
 * @author 공통 페이징 처리 함수
 * @returns prevDoc, nextDoc, docList, prevTarget, data
 * @param data       : 표출할 데이터
 * @param type       : 페이징 타입 next & prev
 * @param docList    : 호출한 페이지 의 이전페이지 리스트
 * @param prevTarget : 이전 페이지 호출 Index
**/ 
export default function Pagination (data, type, docList, prevTarget) {

    var type         = type       == undefined ? '' : type;
    var docList      = docList    == undefined ? [] : docList;
    var prevTarget   = prevTarget == undefined ? 0  : prevTarget;
    var countPerPage = 10;
    var prevDoc;
    var nextDoc;

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

    //마지막 페이지일 경우
    if(data.length <= countPerPage){

        if(type == "next"){//페이지 이동중 마지막 페이지일 경우
            nextDoc = data[0].doc_id
            prevDoc = type == "" ? docList[0] : docList[docList.length - (prevTarget + 2)]
        }
        else {//첫 페이지가 마지막 페이지일 경우
            nextDoc = data[0].doc_id
            prevDoc = data[0].doc_id
        }
    }
    else{//마지막 페이지가 아닐 경우

        nextDoc = data[Number(data.length-1)].doc_id
        prevDoc = type == "" ? docList[0] : docList[docList.length - (prevTarget + 2)]
    
        //페이지 처리를 위해 실제 보여지는 수 보다 하나 더 많이 들고오는 부분 처리 
        data.splice(data.length - 1);
    }

    //리턴 파라메터를 배열로 작성
    let pagingArr = [prevDoc, nextDoc, docList, prevTarget, data]

    return pagingArr;
}
