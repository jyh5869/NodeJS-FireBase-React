import sys
import re
import os

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import json
import cv2
import PIL
import PIL.Image
import pathlib
import numpy               as np
import tensorflow          as tf
import tensorflow_datasets as tfds
import matplotlib.pyplot   as plt 
import firebase_admin
import time, random
import urllib.request

from bs4            import BeautifulSoup
from time           import localtime
from time           import strptime
from selenium       import webdriver
from firebase_admin import credentials
from firebase_admin import firestore
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome          import ChromeDriverManager
from selenium.webdriver.common.by      import By


# Firebase 연계 초기 세팅
cred = credentials.Certificate('Router/firebase_appKey_Movies.json') # server\Router\firebase_appKey_Movies.json
firebase_admin.initialize_app(cred)

db = firestore.client()

# 텐서플로 사용 초기 세팅


# 변수 선언
# epochs - 하나의 데이터셋을 몇 번 반복 학습할지 정하는 파라미터. 
#          같은 데이터셋이라 할지라도 가중치가 계속해서 업데이트되기 때문에 모델이 추가적으로 학습가능
epochs          = 3                                       # 훈련반복 횟수 
down_status     = str(sys.argv[5])                        # 이미지 크롤링 결과
load_status     = ""                                      # 데이터 로드 결과 (Success / Fail -> error)
training_status = ""                                      # 훈련 결과 (Success / Fail -> error)
parmas_hist     = {}                                      # 훈련 과정 파라메터 (epochs, step, verbose) 
history_hist    = {}                                      # 훈련 결과 파라메터 (Loss,accuracy , val_loss, val_accuracy)
class_names     = ""                                      # 훈련 클래스 리스트
class_count     = 0                                       # 훈련 클래스 갯수
training_Id     = str(time.time()).replace('.','')[0:13]  # 훈련 시간 (이력의 id값으로 활용, nodejs에서 활용할수 있는 13자리 숫자 폼으로 변환)
save_model_nm   = str(sys.argv[1])                        # 훈현 모델명         
dataset_url     = str(sys.argv[2])                        # 데이터셋 url
result_img_path = str(sys.argv[3])                        # 훈련과정 이미지 저장 경로
save_model_url  = str(sys.argv[4])                        # 모델 저장 경로
start_dt        = ""
end_dt          = ""


data_dir = pathlib.Path(dataset_url)
# 매개변수 정의
batch_size = 32  # 몇 개의 샘플로 가중치를 갱신할 것인지 설정합니다.
img_height = 180 # 이미지 높이
img_width = 180  # 이미지 넓이

# 트레이닝, 검증  데이터 생성 (검증 분할을 사용 이미지의 80%를 훈련에 사용하고 20%를 유효성 검사에 사용합니다.)
train_ds = tf.keras.preprocessing.image_dataset_from_directory(
    data_dir,
    validation_split=0.1, # validation_split = 0.2 - 데이터 셋중 80%를 훈련 20%를 검증에 사용
    subset="training",
    seed=123,
    image_size=(img_height, img_width),
    batch_size=batch_size,
)
val_ds = tf.keras.preprocessing.image_dataset_from_directory(
    data_dir,
    validation_split=0.1, # validation_split = 0.2 - 데이터 셋중 80%를 훈련 20%를 검증에 사용
    subset="validation",
    seed=123,
    image_size=(img_height, img_width),
    batch_size=batch_size,
)

train_images, train_labels = tuple(zip(*train_ds))

train_images = np.array(train_images)
train_labels = np.array(train_labels)
# print(train_images)
# print('★★★★★★★★★★★')
# print(train_labels)
# class_names 속성을 이용해 클래스리스트, 갯수 조회(파일경로의 하위 디렉토리명)
class_names = train_ds.class_names
print(class_names)
# class_names =  if aa == 0 else aa
class_count = len(class_names)
# idx = np.argsort(class_names)


# idx = np.argsort(train_labels)
# train_images = train_images[0:3]
# train_labels = train_labels[0:3]

# print(train_images)
# idx = np.argsort(test_labels)
# test_images = test_images[idx]
# test_labels = test_labels[idx]

# labels = ["T-Shirt", "Trouser", "Pullover", "Dress", "Coat", 
#           "Sandal", "Shirt", "Sneaker", "Bag", "Ankle boot"]
# train_ds = train_ds.label[idx]
# print(train_labels)
label_mapping = dict(zip(range(class_count), class_names))
print(label_mapping)
def get_data(mapping, classes):
    X_train, X_test, y_train, y_test = [], [], [], []
    for cls in classes:
        bb = {v:k for k,v in mapping.items()} #// {'AA': '0', 'BB': '1', 'CC': '2'}
        print(bb)
        idx = bb.get(cls)
        print(idx)
        # idx = mapping[cls]
        # idx = 0
        start = idx*6000
        end = idx*6000+6000
        # print(start)
        # print(end)
        X_train.append(train_images[start : end])
        y_train.append(train_labels[start : end])
    return X_train, y_train

X_train, y_train = get_data(label_mapping, classes=["cosmos"])

# dataset = tf.data.Dataset.from_tensor_slices(({"image":X_train}, y_train))
# print(X_train)
# print(y_train)


