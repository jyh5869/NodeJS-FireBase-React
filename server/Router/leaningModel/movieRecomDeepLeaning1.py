import sys

import pandas as pd #데이터 프레임 라이브러리
import numpy  as np #데이터 프레임 의 배열화에 쓰임 (결과값 반환을 위해)
import warnings; warnings.filterwarnings('ignore')#협업 필터링(유사 콘텐츠 추출)

pd.set_option('display.max_rows', None)
pd.set_option('display.max_colwidth', None)

movies = pd.read_csv('C:/Users/all4land/Desktop/NodeJS-FireBase-React/client/src/data/movie/tmdb_5000_movies.csv')
# print(movies.shape)
# print(movies.columns)
# print(movies.head(20))

movies_df = movies[['id','title','genres','vote_average', 'vote_count', 'popularity', 'keywords', 'overview']]
# print(movies_df['genres'].head(1))
# print(movies_df['keywords'].head(1))

from ast import literal_eval #해당 데이터를 1. 리스트화 한 뒤 2. 벨류만 추출

movies_df['genres']   = movies_df['genres'].apply(literal_eval)
movies_df['keywords'] = movies_df['keywords'].apply(literal_eval)
# print(movies_df['genres'].head(1))
# print(movies_df['keywords'].head(1))
movies_df['genres']   = movies_df['genres'].apply(lambda x : [y['name'] for y in x])
movies_df['keywords'] = movies_df['keywords'].apply(lambda x : [y['name'] for y in x])
# print(movies_df['genres'].head(1))
# print(movies_df['keywords'].head(1))


from sklearn.feature_extraction.text import CountVectorizer #추출한 벨류를 벨류 + 공백으로 구성하여 백터화

#CountVectorizer를 적용하기 위해 공백문자로 word단위가 구분되는 문자열로 변환.
movies_df['generes_literal'] = movies_df['genres'].apply(lambda x :  (' ').join(x))
# print(movies_df['generes_literal'].head(10))
count_vect = CountVectorizer(min_df=0, ngram_range=(1,2))
genre_mat  = count_vect.fit_transform(movies_df['generes_literal'])
# print(genre_mat)
# print(genre_mat.shape)


#피처 벡터화된 행렬에 cosine_similarity( )를 적용해서 반환된 코사인 유사도 행렬의 크기 
#행의 유사도 값이 높은 순으로 정렬된 행렬의 위치인덱스 값을 추출한다.
from sklearn.metrics.pairwise import cosine_similarity 

genre_sim = cosine_similarity(genre_mat, genre_mat)
# print(genre_sim.shape)
# print(genre_sim[:1])

genre_sim_sorted_ind = genre_sim.argsort()[:,::-1]
# print(genre_sim_sorted_ind[:1])



#단순 유사 콘텐츠 추출
def find_sim_movie(df, sorted_ind, title_name, top_n=10):
    #인자로 입력된 movies_df DataFrame에서 'title'칼럼이 입력된 title_name값인 DataFrame 추출
    title_movie = df[df['title'] == title_name]

    #title_named을 가진 DataFrame의 index객체를 ndarray로 반환하고
    #sorted_ind 인자로 입력된 genre_sim_sorted_ind 객체에서 유사도 순으로 top_n개의 index추출
    title_index = title_movie.index.values
    similar_indexes = sorted_ind[title_index, :(top_n)]

    #추출된 top_n index출력, top_n index는 2차원 데이터임
    #dataframe에서 index로 사용하기 위해서 1차원 array로 변경
    #print(similar_indexes)
    similar_indexes = similar_indexes.reshape(-1)

    return df.iloc[similar_indexes]


#유사 콘텐츠를 뽑을 대상 추출
movie_idx = int(sys.argv[1])
# movie_idx = 100
selectMovie = movies_df[movies_df['id'] == movie_idx]
# print(selectMovie)
title = selectMovie.iloc[0]['title']
# print(title)

similar_movies = find_sim_movie(movies_df, genre_sim_sorted_ind, title , 10)
# print(similar_movies.info())
# print(similar_movies)
# print(similar_movies[['id', 'title', 'vote_count', 'vote_average']].to_json())

# print(movies_df[['title', 'vote_count', 'vote_average']].sort_values('vote_average', ascending=False)[:10])
# print(movies_df[['id', 'title', 'vote_count', 'vote_average']].sort_values('vote_average', ascending=False)[:10].to_json())
# print(movies_df[['title', 'vote_count', 'vote_average']].sort_values('vote_average', ascending=False)[:10].to_numpy())



percentile = 0.6 #분위
m = movies['vote_count'].quantile(percentile) #해당분위 데이터 추출
C = movies['vote_average'].mean() #투표 평균 추출

#가중 투표 평균
def weighted_vote_average(record): 
    v = record['vote_count']
    R = record['vote_average']

    return ( (v/(v+m)) * R) + ( (m/(m+v))*C )


movies_df['weighted_vote'] = movies.apply(weighted_vote_average, axis=1)
movies_df[['title', 'weighted_vote', 'vote_average', 'vote_count']].sort_values('weighted_vote', ascending=False)[:10]
# print(movies_df['title'].head(10))
# print(movies_df.head(10))


genre_sim_sorted_ind = genre_sim.argsort()[:,::-1]
# print(genre_sim_sorted_ind[:1])


#유사한 콘텐츠 20개 추출하여 가중치별로 top10을 추출
def find_sim_movie_weight(df, sorted_ind, title_name, top_n=10):
    #인자로 입력된 movies_df DataFrame에서 'title'칼럼이 입력된 title_name값인 DataFrame 추출
    title_movie = df[df['title'] == title_name]
    #print(title_movie)
    title_index = title_movie.index.values

    #top_n의 2배에 해당하는 장르 유사성이 높은 인덱스 추출
    similar_indexes = sorted_ind[title_index, :(top_n*2)]
    similar_indexes = similar_indexes.reshape(-1)

    #기준 영화 인덱스는 제외
    similar_indexes = similar_indexes[similar_indexes != title_index]

    #top_n의 2배에 해당하는 후보군에서 weight_vote가 노은 순으로 top_n만큼 추출
    return df.iloc[similar_indexes].sort_values('weighted_vote', ascending=False)[:top_n]


similar_movies = find_sim_movie_weight(movies_df, genre_sim_sorted_ind, title, 10)
# print(similar_movies[['id', 'title', 'vote_average', 'weighted_vote']].to_json())



