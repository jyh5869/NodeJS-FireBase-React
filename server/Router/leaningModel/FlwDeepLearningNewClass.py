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


# 변수 선언
# epochs - 하나의 데이터셋을 몇 번 반복 학습할지 정하는 파라미터. 
#          같은 데이터셋이라 할지라도 가중치가 계속해서 업데이트되기 때문에 모델이 추가적으로 학습가능
epochs          = 10                                      # 훈련반복 횟수 
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
label_name      = []
label_count     = 0

# Firebase 연계 초기 세팅
cred = credentials.Certificate('Config/firebase_appKey_Movies.json') # server\Router\firebase_appKey_Movies.json
firebase_admin.initialize_app(cred)

db = firestore.client()

# 데이터 조회 1 - (학습된 클레스 리스트 호출)
class_list_ref    = db.collection("model_class_list")
class_list_query  = class_list_ref.where('model_nm', '==', save_model_nm).where('use_yn', '==', 'Y').where('train_dt', '!=', '')
class_list_docs   = class_list_query.stream()  # 쿼리 조건에 맞는 데이터 가져오기
class_list_dict   = list(map(lambda x: x.to_dict(), class_list_docs))  # list(Map) 타입으로 데이터 형식 변경 (DataFrame으로 사용하기 위함)


try:

    data_dir = pathlib.Path(dataset_url)

    for index, value in enumerate(class_list_dict, start=0):
        label_name.append(value['class_kor_nm'])

    label_count = len(label_name)
    if len(label_name) == 0 : quit()

    # 매개변수 정의
    batch_size = 10000  # 몇 개의 샘플로 가중치를 갱신할 것인지 설정합니다.
    img_height = 180 # 이미지 높이
    img_width = 180  # 이미지 넓이

    # 트레이닝, 검증  데이터 로드
    train_ds  = tf.keras.preprocessing.image_dataset_from_directory(
        data_dir,
        image_size=(img_height, img_width),
        batch_size=batch_size,
    )
    val_ds = tf.keras.preprocessing.image_dataset_from_directory(
        data_dir,
        image_size=(img_height, img_width),
        batch_size=batch_size,
    )

    class_names = train_ds.class_names
    class_count = len(class_names)

    AUTOTUNE = tf.data.AUTOTUNE
    def get_data(mapping, classes, counter, train_images, train_labels):
        x_train, y_train =  [], []

        for cls in classes:
            print('------- '+ cls +' --------')
            bb = {v:k for k,v in mapping.items()} #// {'AA': '0', 'BB': '1', 'CC': '2'}
            idx = bb.get(cls)

            idxStr = sum(list(counter.values())[0:idx])    
            idxCnt = counter.get(idx)
            
            start = idxStr
            end = idxStr+idxCnt

            x_train.append(train_images[start : end])
            y_train.append(train_labels[start : end])

        label_train = []
        for index, value in enumerate(y_train, start=0):
            label_train.append(class_names[int(value[0])]) 
            for indexJ, valueJ in enumerate(value, start=0):
                y_train[index][indexJ] = index


        x_train = np.array(x_train)
        y_train = np.array(y_train)
        
        x_train = [item for sublist in x_train for item in sublist]
        y_train = [item for sublist in y_train for item in sublist]

        x_train = np.asarray(x_train)
        y_train = np.asarray(y_train)

        return x_train, y_train


    def setDataset(train_ds):

        for images, labels in train_ds.take(1):  # only take first element of dataset
            
            train_images = images.numpy()
            train_labels = labels.numpy()

            idx = np.argsort(train_labels)
            # print(idx)
            
            train_images = train_images[idx]
            train_labels = train_labels[idx]

            class_count = len(class_names)
            idx = np.argsort(class_names)

            label_mapping = dict(zip(range(class_count), class_names))
            # print(label_mapping)

            #  라벨 배열을 통해 클레스별 이미지 갯수를 구함
            counter = {}
            for value in train_labels:
                try: counter[value] += 1
                except: counter[value ] = 1

            # print(counter)

            x_train, y_train = get_data(mapping=label_mapping, classes=label_name, counter=counter, train_images=train_images, train_labels=train_labels)

            x_train = tf.convert_to_tensor(x_train)
            y_train = tf.convert_to_tensor(y_train)
            # print('train_labels', train_labels)
            
            train_ds = tf.data.Dataset.from_tensor_slices(( x_train, y_train))

        return train_ds


    train_ds = setDataset(train_ds).cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE).batch(32)
    val_ds   = setDataset(val_ds).cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE).batch(32)

except ValueError as e:
    load_status = 'Fail -> ' + str(e)
except TypeError as e:
    load_status = 'Fail -> ' + str(e)
except NameError as e:
    load_status = 'Fail -> ' + str(e)
except ZeroDivisionError as e:
    load_status = 'Fail -> ' + str(e)
except OverflowError as e:
    load_status = 'Fail -> ' + str(e)
else :
    load_status = 'Success'

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
    num_classes = label_count
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
            tf.keras.layers.Dense(num_classes)
        ]
    )

    model.compile(
        optimizer='adam',
        loss=tf.losses.SparseCategoricalCrossentropy(from_logits=True),
        metrics=['accuracy']
    )

    # 모델 훈련 
    try:
        start_dt = str(time.time()).replace('.','')[0:13]
        
        history = model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=epochs,
            verbose=0
        )
        end_dt   = str(time.time()).replace('.','')[0:13]
    except ValueError as e:
        training_status = 'Fail -> ' + str(e)
    except TypeError as e:
        training_status = 'Fail -> ' + str(e)
    except NameError as e:
        training_status = 'Fail -> ' + str(e)
    except ZeroDivisionError as e:
        training_status = 'Fail -> ' + str(e)
    except OverflowError as e:
        training_status = 'Fail -> ' + str(e)
    else :
        parmas_hist = history.params
        history_hist = history.history
        # loss, acc = model.evaluate(val_ds)
        # print("Accuracy = ", acc)

        # 모델 레이어 보기
        # model.summary()

        # 모델 검증 후 저장
        # model.save('model.h5.flower1')
        model.save(save_model_url + save_model_nm +'.h5')

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

        result_img_path = str(result_img_path + save_model_nm + '_'+ training_Id + '.png')

        plt.savefig(result_img_path)

        training_status = 'Success'



# 훈련 클래스 리스트
print('class_names -> ' + str(class_names) + str(class_count))
# 훈련 과정 파라메터
print('parmas_hist -> ' + str(parmas_hist))
# 훈련 결과 파라메터
print('history_hist -> ' + str(history_hist))
# 훈련 데이터 로드
print('load_status -> ' + str(load_status))
# 훈련 정상여부
print('training_status -> '+ str(training_status))
# 모델 DB IDX = 날짜 로컬타임으로
print('training_Id -> ' + str(training_Id))

data_documnets = {
    'id'              : training_Id,
    'model_nm'        : save_model_nm,
    'down_status'     : down_status,
    'load_status'     : load_status,
    'training_status' : training_status,
    'class_nm'        : label_name,
    'verbose'         : parmas_hist ['verbose']                                            if len(parmas_hist)  != 0 else 0,
    'epochs'          : parmas_hist ['epochs']                                             if len(parmas_hist)  != 0 else 0,
    'steps'           : parmas_hist ['steps']                                              if len(parmas_hist)  != 0 else 0,
    'loss'            : history_hist['loss'][len(history_hist['loss']) -1]                 if len(history_hist) != 0 else 0,
    'accuracy'        : history_hist['accuracy'][len(history_hist['accuracy']) -1]         if len(history_hist) != 0 else 0,
    'val_loss'        : history_hist['val_loss'][len(history_hist['val_loss']) -1]         if len(history_hist) != 0 else 0,
    'val_accuracy'    : history_hist['val_accuracy'][len(history_hist['val_accuracy']) -1] if len(history_hist) != 0 else 0,
    'result_img_path' : result_img_path,
    'save_model_url'  : save_model_url,
    'dataset_url'     : dataset_url,
    'start_dt'        : start_dt,
    'end_dt'          : end_dt
}

# 모델 훈련 결과 데이터 INSERT
db.collection('model_trn_hist').document(training_Id).set(data_documnets)
