
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
import pandas              as pd
import tensorflow          as tf
import tensorflow_datasets as tfds
import tensorflow_hub      as hub #
import tensorflow_io       as tfio #
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
from IPython        import display #
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome          import ChromeDriverManager
from selenium.webdriver.common.by      import By

# ※참고사항 : tesorflow_io, tensorflowr 호환 버전 확인 필요 (URL : pypi.org/project/tensorflow-io/)
# ※참고링크 : www.tensorflow.org/tutorials/audio/transfer_learning_audio?hl=ko



dn_url = 'C:/Users/all4land/.keras/datasets/animalSound/'
# YAMNet : MobileNetV1 깊이별 분리형 컨볼루션 아키텍처를 사용하는 사전 훈련된 신경망 
yamnet_model_handle = 'https://tfhub.dev/google/yamnet/1'
yamnet_model = hub.load(yamnet_model_handle)
# print(yamnet_model)


# 오디오 샘플 데이터 로드
testing_wav_file_name = tf.keras.utils.get_file(
    'miaow_16k.wav',
    'https://storage.googleapis.com/audioset/miaow_16k.wav',
    cache_dir = dn_url,
    cache_subdir = 'test_data'
)
# print(testing_wav_file_name)



# 오디오 파일 로드하는 함수
def load_wav_16k_mono(filename):

    file_contents = tf.io.read_file(filename)
    
    wav, sample_rate = tf.audio.decode_wav(
          file_contents,
          desired_channels=1
    )
    wav = tf.squeeze(wav, axis=-1)
    
    sample_rate = tf.cast(sample_rate, dtype=tf.int64)
    
    wav = tfio.audio.resample(wav, rate_in=sample_rate, rate_out=16000)
    
    return wav


testing_wav_data = load_wav_16k_mono(testing_wav_file_name)
# plt.plot(testing_wav_data)
# plt.show()
# Play the audio file.
# display.Audio(testing_wav_data,rate=16000)



# YAMNET 모델의 CLASS 리스트 추출 및 출력
class_map_path = yamnet_model.class_map_path().numpy().decode('utf-8')
class_names = list(pd.read_csv(class_map_path)['display_name'])
# print(len(class_map_path))

# for name in class_names[:20]:
#     print(name)
# print('...')

# ※ 임베딩 : 사람이 쓰는 자연어를 기계가 이해할 수 있는 숫자의 나열인 백터로 바꾸는 과정 및 결과물
scores, embeddings, spectrogram = yamnet_model(testing_wav_data)

class_scores   = tf.reduce_mean(scores, axis=0)
top_class      = tf.argmax(class_scores)
inferred_class = class_names[top_class]

print(f'The main sound is:    {inferred_class  }')
print(f'The embeddings shape: {embeddings.shape}')


# 링크로 들어가서 수동으로 다운 받기
# audio_data = tf.keras.utils.get_file(
#     'master.zip',
#     'https://github.com/karoldvl/ESC-50/archive/master.zip',
#     cache_dir = dn_url,
#     cache_subdir = 'datasets'
# )


# 메타정보가 담긴 엑셀파일 및 원천 오디오데이터 로드
esc50_csv      = dn_url + 'datasets/ESC-50-master/meta/esc50.csv'
base_data_path = dn_url + 'datasets/ESC-50-master/audio/'

pd_data = pd.read_csv(esc50_csv)
pd_data.head()
print(pd_data.head())


# 개와 고양이 두클래스만을 포함한 PD 데이터프레임 생성
my_classes = ['dog', 'cat']
map_class_to_id = {'dog':0, 'cat':1}

filtered_pd = pd_data[pd_data.category.isin(my_classes)]

class_id    = filtered_pd['category'].apply(lambda name : map_class_to_id[name])
filtered_pd = filtered_pd.assign(target = class_id)

full_path   = filtered_pd['filename'].apply(lambda row  : os.path.join(base_data_path, row))
filtered_pd = filtered_pd.assign(filename = full_path)
print(filtered_pd.head(10))



filenames = filtered_pd['filename']
targets   = filtered_pd['target'  ]
folds     = filtered_pd['fold'    ]
#텐서플로 데이터셋 생성
main_ds = tf.data.Dataset.from_tensor_slices((filenames, targets, folds))
main_ds.element_spec



def load_wav_for_map(filename, label, fold):
    return load_wav_16k_mono(filename), label, fold

main_ds = main_ds.map(load_wav_for_map)
print(main_ds.element_spec)
print("---------------------------------------------------------------")



# 자연어 처리(백터화 임베딩)
def extract_embedding(wav_data, label, fold):
    
    scores, embeddings, spectrogram = yamnet_model(wav_data)
    num_embeddings = tf.shape(embeddings)[0]
    return  (
              embeddings,
              tf.repeat(label, num_embeddings),
              tf.repeat(fold, num_embeddings)
            )

# 임베딩된 데이터셋 추출
main_ds = main_ds.map(extract_embedding).unbatch()
print(main_ds.element_spec)



cached_ds = main_ds.cache()
train_ds  = cached_ds.filter(lambda embedding, label, fold: fold <  4)
val_ds    = cached_ds.filter(lambda embedding, label, fold: fold == 4)
test_ds   = cached_ds.filter(lambda embedding, label, fold: fold == 5)

# 불필요한 폴드 데이터 삭제 및 데이터셋 세팅
remove_fold_column = lambda embedding, label, fold: (embedding, label)
print('-remove_fold_column-')
print(remove_fold_column)

train_ds = train_ds.map(remove_fold_column)
val_ds   = val_ds.map(remove_fold_column)
test_ds  = test_ds.map(remove_fold_column)

train_ds = train_ds.cache().shuffle(1000).batch(32).prefetch(tf.data.AUTOTUNE)
val_ds   = val_ds.cache().batch(32).prefetch(tf.data.AUTOTUNE)
test_ds  = test_ds.cache().batch(32).prefetch(tf.data.AUTOTUNE)
print("-training dataset-")
print(test_ds)



# 모델 생성 및 훈련
my_model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(1024), dtype=tf.float32,
                          name='input_embedding'),
    tf.keras.layers.Dense(512, activation='relu'),
    tf.keras.layers.Dense(len(my_classes))
], name='my_model')

my_model.summary()

my_model.compile(loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
                optimizer="adam",
                metrics=['accuracy'])

callback = tf.keras.callbacks.EarlyStopping(monitor='loss',
                                            patience=3,
                                            restore_best_weights=True)

history = my_model.fit( train_ds,
                        epochs=20,
                        validation_data=val_ds,
                        callbacks=callback)


loss, accuracy = my_model.evaluate(test_ds)
print("Loss:     ", loss    )
print("Accuracy: ", accuracy)



# 모델 테스트
scores, embeddings, spectrogram = yamnet_model(testing_wav_data)
result = my_model(embeddings).numpy()

inferred_class = my_classes[result.mean(axis=0).argmax()]
print(f'The main sound is: {inferred_class}')




class ReduceMeanLayer(tf.keras.layers.Layer):
    def __init__(self, axis=0, **kwargs):
        super(ReduceMeanLayer, self).__init__(**kwargs)
        self.axis = axis

    def call(self, input):
        return tf.math.reduce_mean(input, axis=self.axis)


# 훈련된 모델 저장 (h5 or directory)
saved_model_path = dn_url + 'model/dogs_and_cats_yamnet'

input_segment = tf.keras.layers.Input(shape=(), dtype=tf.float32, name='audio')
embedding_extraction_layer = hub.KerasLayer(yamnet_model_handle,
                                            trainable=False, name='yamnet')
_, embeddings_output, _ = embedding_extraction_layer(input_segment)
serving_outputs = my_model(embeddings_output)
serving_outputs = ReduceMeanLayer(axis=0, name='classifier')(serving_outputs)
serving_model   = tf.keras.Model(input_segment, serving_outputs)
serving_model.save(saved_model_path, include_optimizer=False)

# 모델 계층 시각화 (모델의 구조를 이미지로 확인)
tf.keras.utils.plot_model(serving_model, show_shapes=True)


# 위의 저장된 모델 호출
reloaded_model   = tf.saved_model.load(saved_model_path)
reloaded_results = reloaded_model(testing_wav_data)

cat_or_dog = my_classes[tf.argmax(reloaded_results)]
print(f'The main sound is: {cat_or_dog}')


# 검증 데이터 세팅
test_pd = filtered_pd.loc[filtered_pd['fold'] == 5]
row = test_pd.sample(1)
filename = row['filename'].item()
waveform = load_wav_16k_mono(filename)
plt.plot(waveform)
display.Audio(waveform, rate=16000)
# print(f'Waveform values: {waveform}')
# print(filename)



# 검증데이터를 YAMNET과 훈련모델에서 분석 및 결과 비교
scores, embeddings, spectrogram = yamnet_model(waveform)
class_scores   = tf.reduce_mean(scores, axis=0)
top_class      = tf.argmax(class_scores)
inferred_class = class_names[top_class]
top_score      = class_scores[top_class]
print(f'[YAMNet] The main sound is: {inferred_class} ({top_score})')

reloaded_results    = reloaded_model(waveform)
your_top_class      = tf.argmax(reloaded_results)
your_inferred_class = my_classes[your_top_class]
class_probabilities = tf.nn.softmax(reloaded_results, axis=-1)
your_top_score      = class_probabilities[your_top_class]
print(f'[My model] The main sound is: {your_inferred_class} ({your_top_score})')




