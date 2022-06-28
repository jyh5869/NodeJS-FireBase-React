import sys
import re
import base64 # 인코딩

import numpy as np
import os
import PIL
import PIL.Image
import tensorflow as tf
import tensorflow_datasets as tfds


import matplotlib.pyplot as plt        # 이미지 표출을 위한 LIB
import pathlib

# TENSOR VERSION
print(tf.__version__)

# 이미지 다운로드 후 경로 세팅
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
    batch_size=batch_size
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

# 데이터 표준화 - RGB 채널 값 [0, 255] ( 신경망에 이상적이지 않습니다. 일반적으로 입력 값을 작게 만들어야 한다.) ->  [0, 1] 범위에 있도록 표준화 
normalization_layer = tf.keras.layers.experimental.preprocessing.Rescaling(1./255)

normalized_ds = train_ds.map(lambda x, y: (normalization_layer(x), y))
image_batch, labels_batch = next(iter(normalized_ds))
first_image = image_batch[0]
# Notice the pixels values are now in `[0,1]`.
print(np.min(first_image), np.max(first_image))


AUTOTUNE = tf.data.AUTOTUNE
# 훈련기간동안 이미지를 메모리에 유지함으로서 사용성능이 높은 온디스크 캐시를 생성
train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)


# 모델 훈련
num_classes = 5 
model = tf.keras.Sequential([
    tf.keras.layers.experimental.preprocessing.Rescaling(1./255),
    tf.keras.layers.Conv2D(32, 1, activation='relu'),
    tf.keras.layers.MaxPooling2D(),
    tf.keras.layers.Conv2D(32, 1, activation='relu'),
    tf.keras.layers.MaxPooling2D(),
    tf.keras.layers.Conv2D(32, 1, activation='relu'),
    tf.keras.layers.MaxPooling2D(),
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(num_classes)
])

model.compile(
    optimizer='adam',
    loss=tf.losses.SparseCategoricalCrossentropy(from_logits=True),
    metrics=['accuracy']
)

# epochs - 하나의 데이터셋을 몇 번 반복 학습할지 정하는 파라미터. 
#          같은 데이터셋이라 할지라도 가중치가 계속해서 업데이트되기 때문에 모델이 추가적으로 학습가능
model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=1 # 하나의 epochs에 대해서만 학습 (빠른 실행을 위해)
)


