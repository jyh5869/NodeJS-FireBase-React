import sys
import re
import json

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import os, time, random
from bs4 import BeautifulSoup
import urllib.request


# C:\Users\all4land\Desktop\reviewDeepLearning2.py

# def chromeWebdriver():
#     options = Options()
#     options.add_argument("lang=ko_KR")  # 언어 설정
#     # options.add_argument("start-maximized") # 창 크기 최대로
#     options.add_argument("disable-infobars")
#     options.add_argument("--disable-extensions")    
#     options.add_experimental_option('detach', True)  # 브라우저 안 닫히게
#     options.add_experimental_option('excludeSwitches', ['enable-logging'])  # 시스템 장치 에러 숨기기
#     user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36'
#     options.add_argument(f'user-agent={user_agent}')    
#     # options.add_argument('--headless')  # 웹 브라우저를 시각적으로 띄우지 않는 headless chrome 옵션
#     driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options) 
#     return driver


# def collect_image(search_word):
#     url = 'https://www.google.co.kr'

#     now = time.localtime()
#     today_time = f'{now.tm_year}{now.tm_mon}{now.tm_mday}_{now.tm_hour}{now.tm_min}{now.tm_sec}'
#     print(today_time)

#     file_path = "c:\\temp\\"

#     os.chdir(file_path)
#     os.makedirs(file_path + today_time + '_' + search_word)
#     os.chdir(file_path + today_time + '_' + search_word)
#     file_save_dir = file_path + today_time + '_' + search_word
#     print(file_save_dir)

#     driver = chromeWebdriver()
#     driver.get(url)
#     time.sleep(random.uniform(2, 3))
#     elem_q = driver.find_element(By.NAME, 'q')
#     elem_q.send_keys(search_word)
#     elem_q.submit()

#     driver.find_element(By.LINK_TEXT, '이미지').click()  # 텍스트 메뉴 '이미지' 링크 클릭
#     # driver.find_element(By.XPATH, '//*[@id="hdtb-msb"]/div[1]/div/div[2]/a').click()
#     time.sleep(random.uniform(1, 2))

#     file_no = 1
#     count = 1
#     img_src = []

#     html = driver.page_source
#     soup = BeautifulSoup(html, 'html.parser')
#     imgs = driver.find_elements(By.CSS_SELECTOR, '#islrg > div.islrc > div a.wXeWr.islib.nfEiy')
#     print(len(imgs))

#     for img in imgs:
#         img_src1 = img.click()  # 이미지 클릭 시 display 되는 url을 찾기 위해 클릭함
#         img_src2 = driver.find_element(By.CSS_SELECTOR, '#Sva75c > div > div > div.pxAole > div.tvh9oe.BIB1wf > c-wiz > div > div.OUZ5W > div.zjoqD > div.qdnLaf.isv-id > div > a')
#         time.sleep(random.uniform(0.2, 0.5))
#         img_src3 = img_src2.find_element(By.TAG_NAME, 'img').get_attribute('src')
#         if img_src3[:4] != 'http':
#             continue
#         print(count, img_src3, '\n')
#         img_src.append(img_src3)
#         count += 1

#     for i in range(len(img_src)):
#         extention = img_src[i].split('.')[-1]
#         ext = ''
#         print(extention)
#         if extention in ('jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF'):
#             ext = '.' + extention
#         else:
#             ext = '.jpg'        
#         try:
#             urllib.request.urlretrieve(img_src[i], str(file_no).zfill(3) + ext)
#             print(img_src[i])
#         except Exception:
#             continue
#         file_no += 1
#         # time.sleep(random.uniform(0.1, 0.5))
#         print(f'{file_no}번째 이미지 저장-----')

#     driver.close()


# if __name__ == '__main__':
#     collect_image('개나리')







































import cv2
import PIL
import PIL.Image
import pathlib
import numpy               as np
import tensorflow          as tf
import tensorflow_datasets as tfds
import matplotlib.pyplot   as plt 

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# TENSOR VERSION
# print(tf.__version__)

# print(data_dir)
data_dir = pathlib.Path('C:/Users/all4land/.keras/datasets/flower_photos_3')

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
    batch_size=batch_size
)

# class_names 속성을 이용해 클래스 조회(파일경로의 하위 디렉토리명)
class_names = train_ds.class_names
# print(class_names)


# 데이터 증강 레이어 적용 1 (Accuracy =  0.5490463376045227)
AUTOTUNE = tf.data.AUTOTUNE
# 훈련기간동안 이미지를 메모리에 유지함으로서 사용성능이 높은 온디스크 캐시를 생성
train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
val_ds = val_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)


# 데이터 증강 (1. 배율 조정  2.이미지  수평, 수직 플립 - 옵션 : [ horizontal_and_vertical : 82.89(av = 80%) / horizontal : 97.57 (av = 90%) ] )
data_augmentation = tf.keras.Sequential(
  [
    tf.keras.layers.experimental.preprocessing.RandomFlip("horizontal", 
                                                 input_shape=(img_height, 
                                                              img_width,
                                                              3)),
    tf.keras.layers.experimental.preprocessing.RandomRotation(0.1),
    tf.keras.layers.experimental.preprocessing.RandomZoom(0.1),
  ]
)


# 새로운 모델 
num_classes = 8
model = tf.keras.Sequential(
    [
        data_augmentation,
        tf.keras.layers.experimental.preprocessing.Rescaling(1./255, input_shape=(img_height, img_width, 3)),
        tf.keras.layers.Conv2D(16, 3, activation='relu'),
        tf.keras.layers.MaxPooling2D(),
        tf.keras.layers.Conv2D(32, 3, activation='relu'),
        tf.keras.layers.MaxPooling2D(),
        tf.keras.layers.Conv2D(64, 3, activation='relu'),
        tf.keras.layers.MaxPooling2D(),
        tf.keras.layers.Dropout(0.2), # 과대적합 방지(정규화의 한 형태인 드롭아웃을 네트워크에 적용) 
        tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dense(8)
    ]
)

model.compile(
    optimizer='adam',
    loss=tf.losses.SparseCategoricalCrossentropy(from_logits=True),
    metrics=['accuracy']
)



# 모델 훈련 후 히스토리 축척
# epochs - 하나의 데이터셋을 몇 번 반복 학습할지 정하는 파라미터. 
#          같은 데이터셋이라 할지라도 가중치가 계속해서 업데이트되기 때문에 모델이 추가적으로 학습가능
epochs = 1
history = model.fit(
  train_ds,
  validation_data=val_ds,
  epochs=epochs,
  verbose=0
)


loss, acc = model.evaluate(val_ds)
# print("Accuracy = ", acc)


# 모델 레이어 보기
# model.summary()


# 모델 저장 및
IMG_SIZE = 180

# img_url = [
#   'C:/Users/all4land/Desktop/validatonImg5.jpg',
#   'C:/Users/all4land/Desktop/validatonImg6.jpg',
#   'C:/Users/all4land/Desktop/validatonImg7.jpg',
#   'C:/Users/all4land/Desktop/validatonImg8.jpg',
# ]


# for index, value in enumerate(img_url, start=0):
#   print(index, value)

#   img = tf.keras.preprocessing.image.load_img(
#     value, target_size=(IMG_SIZE, IMG_SIZE)
#   )
#   img_array = tf.keras.preprocessing.image.img_to_array(img)
#   img_array = tf.expand_dims(img_array, 0) # Create a batch

#   predictions = model.predict(img_array)

#   score = tf.nn.softmax(predictions[0])

#   print(score)
#   print(np.argmax(score))
#   print(
#       "1 This image most likely belongs to {} with a {:.2f} percent confidence."
#       .format(class_names[np.argmax(score)], 100 * np.max(score))
#   )


# 모델 검증 후 저장
# model.save('model.h5.flower1')
model.save('C:/Users/all4land/.keras/model/model_flower_delete.h5')

# 훈련 과정 그래프 표출 
acc = history.history['accuracy']
val_acc = history.history['val_accuracy']

loss = history.history['loss']
val_loss = history.history['val_loss']

epochs_range = range(epochs)

plt.figure(figsize=(8, 8))
plt.subplot(1, 2, 1)
plt.plot(epochs_range, acc, label='Training Accuracy')
plt.plot(epochs_range, val_acc, label='Validation Accuracy')
plt.legend(loc='lower right')
plt.title('Training and Validation Accuracy')

plt.subplot(1, 2, 2)
plt.plot(epochs_range, loss, label='Training Loss')
plt.plot(epochs_range, val_loss, label='Validation Loss')
plt.legend(loc='upper right')
plt.title('Training and Validation Loss')
plt.show()

# 이미지 저장
# 훈련 클래스 리스트
# 훈련 과정 파라메터
print(history.params)
# 훈련 결과 파라메터
print(history.history)
# 훈련 정상여부

