import sys

import re
import base64 # 인코딩

import numpy as np
import cv2
import os
import io
import PIL
import PIL.Image
import tensorflow as tf
import tensorflow_datasets as tfds
import json

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import matplotlib.pyplot as plt # 이미지 표출을 위한 LIB
import pathlib




# json으로 받기.
inputs = sys.stdin.read()
# 문자열로 받은 형태를 json형태로 반환해준다.(dict)
dat = json.loads(inputs)
 
# 그 중에서 array로 담겨져있던 binary코드를 가져온다.
binary_arry = dat['binary']['data']

# print(binary_arry)

#opencv는 바이너리코드를 인코딩하여
#python에서 컨트롤 가능한 비트맵으로 만들어 줄 수 있다.
#각 np의 원소는 uint8이어야 한다. 1byte = 8bits
binary_np = np.array(binary_arry, dtype=np.uint8)
 
# data cv2 np convert
img_np = cv2.imdecode(binary_np, cv2.IMREAD_ANYCOLOR)
 
# 좌측 끝상단에 검은색 네모를 칠한다.
img_np[0:50, 0:50] = 0
 
# convert bytes
# 다시 byte형태를 담은 list로 바꾸어준다.
_, imen = cv2.imencode('.jpg', img_np)
imenb = bytes(imen)
imnb = list(imenb)
 
#보낼때 역시 json으로 보내준다.
result = json.dumps({'img': imnb})
# print(result)

anaImg = io.BytesIO(imenb)















































# TENSOR VERSION
# print(tf.__version__)
IMG_SIZE = 180

(train_ds, val_ds, test_ds), metadata = tfds.load(
    'tf_flowers',
    split=['train[:80%]', 'train[80%:90%]', 'train[90%:]'],
    with_info=True,
    as_supervised=True,
)

# 클레스 갯수와 각 라벨을 추출
num_classes = metadata.features['label']
label_name = metadata.features['label'].int2str



# 저장 모델 로드 하기 
model = tf.keras.models.load_model('model.h5.flower2')

model.compile(loss='binary_crossentropy',
             optimizer='rmsprop',
             metrics=['accuracy'])

# img_url = [
#   'C:/Users/all4land/Desktop/validatonImg.jpg',
#   'C:/Users/all4land/Desktop/validatonImg2.jpg',
#   'C:/Users/all4land/Desktop/validatonImg3.jpg',
# ]

img_url = [
  anaImg
]

for index, value in enumerate(img_url, start=0):
  # print(index, value)

  img = tf.keras.preprocessing.image.load_img(
    value, target_size=(IMG_SIZE, IMG_SIZE)
  )
  img_array = tf.keras.preprocessing.image.img_to_array(img)
  img_array = tf.expand_dims(img_array, 0) # Create a batch

  predictions = model.predict(img_array, verbose = 0)

  score = tf.nn.softmax(predictions[0])

  result = json.dumps({'result' + str(index): "1 This image most likely belongs to {} with a {:.2f} percent confidence.".format(label_name(np.argmax(score)), 100 * np.max(score))})
  print(result)
  # print(score)
  # print(np.argmax(score))
  # print(
  #     "1 This image most likely belongs to {} with a {:.2f} percent confidence."
  #     .format(label_name(np.argmax(score)), 100 * np.max(score))
  # )

