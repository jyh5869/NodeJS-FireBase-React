import sys

import pandas as pd # 데이터 프레임 라이브러리
import numpy  as np # 데이터 프레임 의 배열화에 쓰임 (결과값 반환을 위해)
import warnings; warnings.filterwarnings('ignore')# 협업 필터링(유사 콘텐츠 추출)

from ast                             import literal_eval      # 문자열로 전환
from sklearn.feature_extraction.text import CountVectorizer   # 추출한 벨류를 벨류 + 공백으로 구성하여 백터화
from sklearn.feature_extraction.text import TfidfVectorizer   # 모든문서에 포함된 단어의 경우 구별능력이 떨어진다 판단하고 가중치를 축소 백터화
from sklearn.metrics.pairwise        import linear_kernel     # cosine 유사도 추출 1
from sklearn.metrics.pairwise        import cosine_similarity # cosine 유사도 추출 2
from nltk.stem.snowball              import SnowballStemmer 

pd.set_option('display.max_rows', None)
pd.set_option('display.max_colwidth', None)

#유사 콘텐츠를 뽑을 타겟 추출
selectMovie = movies_df[movies_df['id'] == int(sys.argv[1])]
targetTitle = selectMovie.iloc[0]['title']

#########################################################
############### ↓ 줄거리 유사 콘텐츠 추출 ↓ ###############
#########################################################

md = pd.read_csv('C:/Users/all4land/Desktop/NodeJS-FireBase-React/client/src/data/movie/tmdb_5000_movies copy.csv' , encoding='utf-8')
md['id'] = md['id'].astype('int')# id 값을 int로 형변환
smd = md

#description 데이터를 만들고 결측값을 ''로 채움(fillna(''))
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
titles = smd['title']
indces = pd.Series(smd.index, index=titles)

# 유사 콘텐츠 추출 함수 1 (태그, 미리보기를 참조하여 비슷한 줄거리를 가진 영화 추출)
def getrecommandations1(title):
    index = indces[title]
    sim_scores = list(enumerate(cosine_sim[index]))
    sim_scores = sorted(sim_scores, key=lambda x:x[1], reverse=True)
    sim_scores = sim_scores[1:31]
    movie_indices = [i[0] for i in sim_scores] 
    return titles.iloc[movie_indices]

# 유사 콘텐츠 추출
print(getrecommandations1('The Dark Knight'))



#########################################################
############### ↓ 종합적 유사 콘텐츠 추출 ↓ ###############
#########################################################

credits = pd.read_csv('C:/Users/all4land/Desktop/NodeJS-FireBase-React/client/src/data/movie/tmdb_5000_credits copy.csv' , encoding='utf-8')# 출연진 대이터
credits['id'] = credits['id'].astype(int)# id를 정수값으로 형변환
smd = md.merge(credits, on='id')         # 영화 데이터와 id를 기준으로 join 
#smd = md[md['id'].isin(smd)]            # 아이디 값이 있는 열로 추출 (오류?)


smd['cast']      = smd['cast'].apply(literal_eval)    
smd['crew']      = smd['crew'].apply(literal_eval)    
smd['genres']    = smd['genres'].apply(literal_eval)  
smd['keywords']  = smd['keywords'].apply(literal_eval)# cast데이터의 ''문자열안에 있는 document를 진짜 document로 만든다.
smd['cast_size'] = smd['cast'].apply(lambda x :len(x))# 배우 수를 적는다.
smd['crew_size'] = smd['crew'].apply(lambda x: len(x))# 스태프 수를 적는다.

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
s.name = 'keywords' # 컬럼명 할당
s = s.value_counts()# 단어리스트와 단어별 갯수 
s = s[s>1]          # 하나 밖에 없는 단어 삭제

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

#print(str(smd['soup']))
#print("p : ", smd.head(1))

# 비교데이터를 백터화 후 코사인 유사도 추출
count = CountVectorizer(analyzer='word', ngram_range=(1, 2), min_df=0, stop_words='english')
count_matrix = count.fit_transform(smd['soup'])
cosine_sim = cosine_similarity(count_matrix, count_matrix)

# titleㅌ로 인덱스 생성
smd = smd.reset_index()
titles = smd['title_x']
indces = pd.Series(smd.index, index=smd['title_x'])

# 종합 유사 콘텐츠 추출 함수
def getrecommandations2(title):
    index = indces[title]
    sim_scores = list(enumerate(cosine_sim[index]))
    sim_scores = sorted(sim_scores, key=lambda x:x[1], reverse=True)
    sim_scores = sim_scores[1:31]
    movie_indices = [i[0] for i in sim_scores] 
    return titles.iloc[movie_indices] 

# 유사 컨텐츠 추출
print(getrecommandations2('The Dark Knight'))






