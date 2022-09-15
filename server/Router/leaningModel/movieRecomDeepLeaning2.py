import sys

import json
import pandas as pd # 데이터 프레임 라이브러리
import numpy  as np # 데이터 프레임 의 배열화에 쓰임 (결과값 반환을 위해)
import warnings; warnings.filterwarnings('ignore') # 협업 필터링(유사 콘텐츠 추출)
import firebase_admin # 파이어베이스 클라우드 연동 라이브러리

from ast                             import literal_eval      # 문자열로 전환
from sklearn.feature_extraction.text import CountVectorizer   # 추출한 벨류를 벨류 + 공백으로 구성하여 백터화
from sklearn.feature_extraction.text import TfidfVectorizer   # 모든문서에 포함된 단어의 경우 구별능력이 떨어진다 판단하고 가중치를 축소 백터화
from sklearn.metrics.pairwise        import linear_kernel     # cosine 유사도 추출 1
from sklearn.metrics.pairwise        import cosine_similarity # cosine 유사도 추출 2
from nltk.stem.snowball              import SnowballStemmer 
from firebase_admin                  import credentials
from firebase_admin                  import firestore


# Firebase 연계 초기 세팅
cred = credentials.Certificate('Router/firebase_appKey_Movies.json') # server\Router\firebase_appKey_Movies.json
firebase_admin.initialize_app(cred)

db = firestore.client()

# Pandad 옵션 값 세팅
pd.set_option('display.max_rows', None)
pd.set_option('display.max_colwidth', None)

# 데이터 컬렉션 세팅
movies_ref     = db.collection("movies")
credits_ref    = db.collection("credits")

# 데이터 조회 1 (조회하고자 하는 영화 데이터 존재 유무 파악)
movies_query2  = movies_ref.where ('id', '==', sys.argv[1]) # 개봉일 기준 limit의 레코드 호출 쿼리 작성
credits_query2 = credits_ref.where('id', '==', sys.argv[1]) # 개봉일 기준 limit의 레코드 호출 쿼리 작성
movies_docs2   = movies_query2.stream()  # 쿼리 조건에 맞는 데이터 가져오기
credits_docs2  = credits_query2.stream() # 쿼리 조건에 맞는 데이터 가져오기

movies_dict2   = list(map(lambda x: x.to_dict(), movies_docs2))  # list(Map) 타입으로 데이터 형식 변경 (DataFrame으로 사용하기 위함)
credits_dict2  = list(map(lambda x: x.to_dict(), credits_docs2)) # list(Map) 타입으로 데이터 형식 변경 (DataFrame으로 사용하기 위함)

# 해당 데이터 존재 여부 파악 (없을 경우에는 DB조회를 실행하지 않기 위함 - 값: 0 OR 1 이상)
movieExistYn   = len(pd.DataFrame(movies_dict2))
creditsExistYn = len(pd.DataFrame(credits_dict2))

# print(json.dumps({'movieExistYn'   : movieExistYn}))
# print(json.dumps({'creditsExistYn' : creditsExistYn}))



#########################################################
############### ↓ 줄거리 유사 콘텐츠 추출 ↓ ###############
#########################################################

if movieExistYn != 0:

    # 데이터 조회
    movies_query   = movies_ref.order_by("id").limit(10)           # 개봉일 기준 limit의 레코드 호출 쿼리 작성
    movies_docs    = movies_query.stream()                          # 쿼리 조건에 맞는 데이터 가져오기
    movies_dict    = list(map(lambda x: x.to_dict(), movies_docs))  # list(Map) 타입으로 데이터 형식 변경 (DataFrame으로 사용하기 위함)

    # 데이터 세팅 1. Firebase (일일 사용량 제한으로 조회 limit를 100~1000사이로 할 것), 2. Excel.csv (조회 제한은 없으나 속도가 느리다.)
    md = pd.DataFrame(movies_dict)
    # md = pd.read_csv('C:/Users/all4land/Desktop/NodeJS-FireBase-React/client/src/data/movie/tmdb_5000_movies copy.csv', encoding='utf-8')
    md['id'] = md['id'].astype('int') # id 값을 int로 형변환
    smd = md
    # print(smd['id']) 대상 IDX 조회

    # 유사 콘텐츠를 뽑을 타겟 추출 (title, id)
    # selectMovie = smd[smd['id'] == int(sys.argv[1])]
    # targetTitle = selectMovie.iloc[0]['title']
    # targetId    = selectMovie.iloc[0]['id']
    targetId    = int(sys.argv[1])

    # description 데이터를 만들고 결측값을 ''로 채움(fillna(''))
    smd['tagline']     = smd['tagline'].fillna('')
    smd['description'] = smd['overview'] + smd['tagline']
    smd['description'].fillna('')
        

    # 데이터 백터화
    tf = TfidfVectorizer(analyzer='word', ngram_range=(1, 2), min_df=0, stop_words='english')
    tfidf_matrix = tf.fit_transform(smd['description'])

    # cosine 유사도 추출
    cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)

    # smd에 index를 포함하고 title을 인덱스로 만든다.
    smd = smd.reset_index()

    smd['genres'] = smd['genres'].apply(literal_eval)
    smd['genres'] = smd['genres'].apply(lambda x : [i['name'] for i in x] if isinstance(x, list) else [])

    # 인덱싱할 컬럼을 정제 후 세팅 1. title, 2. id (데이터 무결성 측면에서 id로 선택)
    titles = smd['title'] 
    ids    = smd['id']
    indces = pd.Series(smd.index, index=ids)

    # 유사 콘텐츠 추출 함수 1 (태그, 미리보기를 참조하여 비슷한 줄거리를 가진 영화 추출)
    def getrecommandations1(idx):
        index = indces[idx]
        sim_scores = list(enumerate(cosine_sim[index]))
        sim_scores = sorted(sim_scores, key=lambda x:x[1], reverse=True)
        sim_scores = sim_scores[1:11]#가져올 상위 랭크 갯수 1:11 => 10개
        movie_indices = [i[0] for i in sim_scores] 
        return smd.iloc[movie_indices]

    
    # 해당 데이터 프레임에 조회하고자 하는 데이터 정보 포함 여부 체크
    flag_true_false = (smd['id'] == targetId).any()

    # 유사 컨텐츠 추출
    if flag_true_false:
        print(json.dumps({'totalCnt' : movieExistYn, 'result' : getrecommandations1(targetId)[['id','title', 'genres', 'vote_average']].to_json()}))
    else:
        print(json.dumps({'totalCnt' : 0 , 'result' : "No Result"}))
    
else:
    print(json.dumps({'totalCnt' : 0 , 'result' : "No Result"}))


#########################################################
############### ↓ 종합적 유사 콘텐츠 추출 ↓ ###############
#########################################################


if creditsExistYn != 0:

    #데이터 조회
    credits_query  = credits_ref.order_by("id").limit(10)          # 개봉일 기준 limit의 레코드 호출 쿼리 작성
    credits_docs   = credits_query.stream()                         # 쿼리 조건에 맞는 데이터 가져오기
    credits_dict   = list(map(lambda x: x.to_dict(), credits_docs)) # list(Map) 타입으로 데이터 형식 변경 (DataFrame으로 사용하기 위함)

    # 데이터 세팅 1. Firebase (일일 사용량 제한으로 조회 limit를 100~1000사이로 할 것), 2. Excel.csv (조회 제한은 없으나 속도가 느리다.)
    credits = pd.DataFrame(credits_dict)
    # credits = pd.read_csv('C:/Users/all4land/Desktop/NodeJS-FireBase-React/client/src/data/movie/tmdb_5000_credits copy.csv' , encoding='utf-8')# 출연진 대이터
    credits['id'] = credits['id'].astype(int) # id를 정수값으로 형변환
    smd = md.merge(credits, on='id')          # 영화 데이터와 id를 기준으로 join 
    # smd = md[md['id'].isin(smd)]            # 아이디 값이 있는 열로 추출 (오류?)
    # print(smd['id']) 대상 IDX 조회 

    smd['cast']      = smd['cast'].apply(literal_eval)    
    smd['crew']      = smd['crew'].apply(literal_eval)    
    smd['genres']    = smd['genres'].apply(literal_eval)  
    smd['keywords']  = smd['keywords'].apply(literal_eval) # cast데이터의 ''문자열안에 있는 document를 진짜 document로 만든다.
    smd['cast_size'] = smd['cast'].apply(lambda x :len(x)) # 배우 수를 적는다.
    smd['crew_size'] = smd['crew'].apply(lambda x: len(x)) # 스태프 수를 적는다.

    # 감독인 데이터 추출 함수
    def get_director(x):
        for i in x:
            if i['job'] == 'Director':
                return i['name']
        return np.nan

    # 데이터 정제 (값들만 추출 한 수 가중치를 위해 감독을 3번 넣어준다)
    smd['keywords'] = smd['keywords'].apply(lambda x: [i['name'] for i in x] if isinstance(x, list) else [])
    smd['genres']   = smd['genres'].apply(lambda x : [i['name'] for i in x] if isinstance(x, list) else [])
    smd['cast']     = smd['cast'].apply(lambda x : [i['name'] for i in x] if isinstance(x, list) else [])
    smd['cast']     = smd['cast'].apply(lambda x: x[:3] if len(x) >3 else x)
    smd['cast']     = smd['cast'].apply(lambda x : [str.lower(i.replace(" ", "")) for i in x])
    smd['director'] = smd['crew'].apply(get_director)
    smd['director'] = smd['director'].astype(str).apply(lambda x: str.lower(x.replace(" ", "")))
    smd['director'] = smd['director'].apply(lambda x: [x, x, x])


    s = smd.apply(lambda x: pd.Series(x['keywords']), axis=1).stack().reset_index(level=1, drop=True)
    s.name = 'keywords'  # 컬럼명 할당
    s = s.value_counts() # 단어리스트와 단어별 갯수 
    s = s[s>1]           # 하나 밖에 없는 단어 삭제

    # 키워드를 골라내서 인덱스에 담는 함수 
    def filter_keywords(x):
        words = []
        for i in x:
            if i in s:
                words.append(i)
        return words

    # 정제된 키워드 셋
    smd['keywords'] = smd['keywords'].apply(filter_keywords)

    # 원형에서 변형된 단어를 원형으로 바꾸어준다. (dogs, dogss ... 위와 같은 경우에는 dog가 된다.) 
    stemmer = SnowballStemmer('english')
    stemmer.stem('dogs')

    smd['keywords'] = smd['keywords'].apply(lambda x :[stemmer.stem(i) for i in x])
    smd['keywords'] = smd['keywords'].apply(lambda x: [str.lower(i.replace(" ", "")) for i in x])

    # 전체 비교 데이터 생성 
    smd['soup'] = smd['keywords']+smd['cast']+smd['director']+smd['genres']
    smd['soup'] = smd['soup'].apply(lambda x: ' '.join(x))

    # 비교데이터를 백터화 후 코사인 유사도 추출
    count = CountVectorizer(analyzer='word', ngram_range=(1, 2), min_df=0, stop_words='english')
    count_matrix = count.fit_transform(smd['soup'])
    cosine_sim = cosine_similarity(count_matrix, count_matrix)

    # titleㅌ로 인덱스 생성
    smd = smd.reset_index()
    smd['title'] = smd['title_x']

    indces = pd.Series(smd.index, index=smd['id'])

    # 종합 유사 콘텐츠 추출 함수
    def getrecommandations2(title):
        index = indces[title]
        sim_scores = list(enumerate(cosine_sim[index]))
        sim_scores = sorted(sim_scores, key=lambda x:x[1], reverse=True)
        sim_scores = sim_scores[1:11]
        movie_indices = [i[0] for i in sim_scores] 
        return smd.iloc[movie_indices] 

    # 해당 데이터 프레임에 조회하고자 하는 데이터 정보 포함 여부 체크
    flag_true_false = (smd['id'] == targetId).any()

    # 유사 컨텐츠 추출
    if flag_true_false:
        print(json.dumps({'totalCnt' : creditsExistYn, 'result' : getrecommandations2(targetId)[['id','title', 'genres', 'vote_average']].to_json()}))
    else:
        print(json.dumps({'totalCnt' : 0 , 'result' : "No Result"}))
else:
    print(json.dumps({'totalCnt' : 0 , 'result' : "No Result"}))



