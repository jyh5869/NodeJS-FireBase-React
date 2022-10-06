import sys
import re
import os

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import base64 # 인코딩
import json
import cv2
import io
import PIL
import PIL.Image
import pathlib
import firebase_admin
import numpy               as np
import tensorflow          as tf
import tensorflow_datasets as tfds
import matplotlib.pyplot   as plt # 이미지 표출을 위한 LIB

from time           import localtime
from time           import strptime
from selenium       import webdriver
from firebase_admin import credentials
from firebase_admin import firestore

# Firebase 연계 초기 세팅
cred = credentials.Certificate('Config/firebase_appKey_Movies.json') # server\Router\firebase_appKey_Movies.json
firebase_admin.initialize_app(cred)

db = firestore.client()


# 데이터 조회 1 - (학습된 클레스 리스트 호출)
class_list_ref    = db.collection("model_class_list")
class_list_query  = class_list_ref.where('use_yn', '==', 'Y').where('train_dt', '!=', '')
class_list_docs   = class_list_query.stream()  # 쿼리 조건에 맞는 데이터 가져오기
class_list_dict   = list(map(lambda x: x.to_dict(), class_list_docs))  # list(Map) 타입으로 데이터 형식 변경 (DataFrame으로 사용하기 위함)



# 파일 buffer데이터 받기(json)으로 받기.
inputs = sys.stdin.read()
# 문자열로 받은 형태를 json형태로 반환해준다.(dict)
data = json.loads(inputs)
# 그 중에서 array로 담겨져있던 binary코드를 가져온다.
binary_arry = data['binary']['data']

# opencv는 바이너리코드를 인코딩하여 python에서 컨트롤 가능한 비트맵으로 만들어 줄 수 있다.(각 np의 원소는 uint8이어야 함. 1byte = 8bits)
binary_np = np.array(binary_arry, dtype=np.uint8)
 
# data cv2 np convert
img_np = cv2.imdecode(binary_np, cv2.IMREAD_ANYCOLOR)
 
# 좌측 끝상단에 검은색 네모를 칠한다.
img_np[0:50, 0:50] = 0
 
# convert bytes 후 다시 byte형태를 담은 list로 바꾸어준다.
_, imen = cv2.imencode('.jpg', img_np)
imenb = bytes(imen)
imnb  = list(imenb)
 
# 실제 이미지 분석을 위한 바이트 변수 생성
anaImg = io.BytesIO(imenb)


###############################################################



IMG_SIZE     = 180 # 분석할 이미지 리사이즈 
saveModelUrl = str(sys.argv[1])  # 모델 저장 경로 


# 저장된 분석 모델 로드 하기 
model = tf.keras.models.load_model(saveModelUrl + 'model_flw.h5')

model.compile(loss='binary_crossentropy',
             optimizer='rmsprop',
             metrics=['accuracy'])


# 분석할 이미지 버퍼 세팅
img_url = [ anaImg ]

# 분석
for index, value in enumerate(img_url, start=0):

    img = tf.keras.preprocessing.image.load_img(
      value, target_size=(IMG_SIZE, IMG_SIZE)
    )
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = tf.expand_dims(img_array, 0) # Create a batch

    predictions = model.predict(img_array, verbose = 0)

    score = tf.nn.softmax(predictions[0])


# 분석 결과 데이터 생성후 리턴
print(json.dumps({
    'result': {'korNm': class_list_dict[np.argmax(score)]['class_kor_nm'] ,'endNm' : class_list_dict[np.argmax(score)]['class_eng_nm']},
    'img'   : imnb
}))