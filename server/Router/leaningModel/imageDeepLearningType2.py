import sys
import re
import base64 # 인코딩

import numpy as np
import cv2
import os
import PIL
import PIL.Image

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tensorflow as tf
import tensorflow_datasets as tfds


import matplotlib.pyplot as plt        # 이미지 표출을 위한 LIB
import pathlib

# TENSOR VERSION
print(tf.__version__)

# 이미지 다운로드 후 경로 세팅 - C:/Users/all4land/.keras/datasets
dataset_url = "https://storage.googleapis.com/download.tensorflow.org/example_images/flower_photos.tgz"
data_dir = tf.keras.utils.get_file(origin=dataset_url, 
                                   fname='flower_photos', 
                                   untar=True
)
data_dir = pathlib.Path(data_dir)

# 인자로 받은 리스트의 길이 를 반환 (3670)
# glob - 함수는 인자로 받은 패턴과 이름이 일치하는 모든 파일과 디렉터리의 리스트를 반환 (daisy/dasy1.jpg)
image_count = len(list(data_dir.glob('*/*.jpg')))
print(image_count)

# roses경로의 첫번째 이미지를 표출
roses = list(data_dir.glob('roses/*'))
PIL.Image.open(str(roses[0]))

# 매개변수 정의
batch_size = 32  # 몇 개의 샘플로 가중치를 갱신할 것인지 설정합니다.
batch_size_val = 32  # 몇 개의 샘플로 가중치를 갱신할 것인지 설정합니다.
img_height = 180 # 이미지 높이
img_width = 180  # 이미지 넓이


# 트레이닝, 검증  데이터 생성 (검증 분할을 사용 이미지의 80%를 훈련에 사용하고 20%를 유효성 검사에 사용합니다.)
train_ds = tf.keras.preprocessing.image_dataset_from_directory(
    data_dir,
    validation_split=0.2, # validation_split = 0.2 - 데이터 셋중 80%를 훈련 20%를 검증에 사용
    subset="training",
    seed=123,
    image_size=(img_height, img_width),
    batch_size=batch_size
)
val_ds = tf.keras.preprocessing.image_dataset_from_directory(
    data_dir,
    validation_split=0.2, # validation_split = 0.2 - 데이터 셋중 80%를 훈련 20%를 검증에 사용
    subset="validation",
    seed=123,
    image_size=(img_height, img_width),
    batch_size=batch_size_val
)

# class_names 속성을 이용해 클래스 조회(파일경로의 하위 디렉토리명)
class_names = train_ds.class_names
print(class_names)


# 데이터 시각화 (트레이닝 데이터 이미지를 호출하여 화면에 띄운다.)
# plt.figure(figsize=(10, 10))
# for images, labels in train_ds.take(1):
#     for i in range(9):
#         ax = plt.subplot(3, 3, i + 1)
#         plt.imshow(images[i].numpy().astype("uint8"))
#         plt.title(class_names[labels[i]])
#         plt.axis("off")
#         plt.show()

# 수도으로 이미지 베치 검색
for image_batch, labels_batch in train_ds:
  print(image_batch.shape)
  print(labels_batch.shape)
  break

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

# # 데이터 증강 확인 하기
# plt.figure(figsize=(10, 10))
# for images, _ in train_ds.take(1):
#   for i in range(9):
#     augmented_images = data_augmentation(images)
#     ax = plt.subplot(3, 3, i + 1)
#     plt.imshow(augmented_images[0].numpy().astype("uint8"))
#     plt.axis("off")
#     plt.show()




# 데이터 증강 레이어 적용 1 (Accuracy =  0.5490463376045227)
AUTOTUNE = tf.data.AUTOTUNE
# 훈련기간동안 이미지를 메모리에 유지함으로서 사용성능이 높은 온디스크 캐시를 생성
train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
val_ds = val_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)


# 모델 훈련 및 레이어 적용
num_classes = 5
model = tf.keras.Sequential([
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
])


model.compile(
    optimizer='adam',
    loss=tf.losses.SparseCategoricalCrossentropy(from_logits=True),
    metrics=['accuracy']
)

# 모델 훈련 후 히스토리 축척
# epochs - 하나의 데이터셋을 몇 번 반복 학습할지 정하는 파라미터. 
#          같은 데이터셋이라 할지라도 가중치가 계속해서 업데이트되기 때문에 모델이 추가적으로 학습가능
epochs = 2
history = model.fit(
  train_ds,
  validation_data=val_ds,
  epochs=epochs,
  verbose=0
)

loss, acc = model.evaluate(val_ds)
print("Accuracy = ", acc)


# 모델 레이어 보기
model.summary()


# # 모델 저장 및 로드 하 
# model.save('model.h5.flower2')
# model = load_model('model.h5')

model.compile(loss='binary_crossentropy',
             optimizer='rmsprop',
             metrics=['accuracy'])

IMG_SIZE = 180

img_url = [
  'C:/Users/Younghyun Jo/Desktop/sunflower.jpg',
  'C:/Users/Younghyun Jo/Desktop/tulips.jpg',
  'C:/Users/Younghyun Jo/Desktop/rose.jpg',
]

for index, value in enumerate(img_url, start=0):
  print(index, value)

  img = tf.keras.preprocessing.image.load_img(
    value, target_size=(IMG_SIZE, IMG_SIZE)
  )
  img_array = tf.keras.preprocessing.image.img_to_array(img)
  img_array = tf.expand_dims(img_array, 0) # Create a batch

  predictions = model.predict(img_array)

  score = tf.nn.softmax(predictions[0])

  print(score)
  print(np.argmax(score))
  print(
      "1 This image most likely belongs to {} with a {:.2f} percent confidence."
      .format(class_names[np.argmax(score)], 100 * np.max(score))
  )




































#훈련 과정 그래프 표출 
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





















