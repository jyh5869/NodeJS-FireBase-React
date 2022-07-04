import sys
import re
import base64 # 인코딩

import numpy as np
import cv2
import os
import PIL
import PIL.Image
import tensorflow as tf
import tensorflow_datasets as tfds

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import matplotlib.pyplot as plt        # 이미지 표출을 위한 LIB
import pathlib

# TENSOR VERSION
print(tf.__version__)

(train_ds, val_ds, test_ds), metadata = tfds.load(
    'tf_flowers',
    split=['train[:80%]', 'train[80%:90%]', 'train[90%:]'],
    with_info=True,
    as_supervised=True,
)
IMG_SIZE = 180
batch_size = 32

# class_names 속성을 이용해 클래스 조회(파일경로의 하위 디렉토리명)
class_names = metadata.features['label'].num_classes
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

# # 데이터 표준화 - RGB 채널 값 [0, 255] ( 신경망에 이상적이지 않습니다. 일반적으로 입력 값을 작게 만들어야 한다.) ->  [0, 1] 범위에 있도록 표준화 
# normalization_layer = tf.keras.layers.experimental.preprocessing.Rescaling(1./255)

# normalized_ds = train_ds.map(lambda x, y: (normalization_layer(x), y))
# image_batch, labels_batch = next(iter(normalized_ds))
# first_image = image_batch[0]
# # Notice the pixels values are now in `[0,1]`.
# print(np.min(first_image), np.max(first_image))






# 데이터 증강 1-1 : 배율 및 크기조정
resize_and_rescale = tf.keras.Sequential([
  tf.keras.layers.experimental.preprocessing.Resizing(IMG_SIZE, IMG_SIZE),
  tf.keras.layers.experimental.preprocessing.Rescaling(1./255)
])

# 데이터 증강 1-2 : 이미지 플립
data_augmentation = tf.keras.Sequential([
  tf.keras.layers.experimental.preprocessing.RandomFlip("horizontal_and_vertical"),
  tf.keras.layers.experimental.preprocessing.RandomRotation(0.2),
])


# # 데이터 증강 1 확인 하기
# plt.figure(figsize=(10, 10))
# for images, _ in train_ds.take(1):
#   for i in range(9):
#     augmented_images = data_augmentation(images)
#     ax = plt.subplot(3, 3, i + 1)
#     plt.imshow(augmented_images[0].numpy().astype("uint8"))
#     plt.axis("off")
#     plt.show()





# 데이터세트에 전처리 레이어 적용하기 1
AUTOTUNE = tf.data.AUTOTUNE

# 데이터 증강 1 레이어 적용 1
def prepare(ds, shuffle=False, augment=False):
  # Resize and rescale all datasets
  ds = ds.map(lambda x, y: (resize_and_rescale(x), y), 
               num_parallel_calls=AUTOTUNE)

  if shuffle:
    ds = ds.shuffle(1000)

  # Batch all datasets
  ds = ds.batch(batch_size)

  # Use data augmentation only on the training set
  if augment:
    ds = ds.map(lambda x, y: (data_augmentation(x, training=True), y), 
                num_parallel_calls=AUTOTUNE)

  # Use buffered prefecting on all datasets
  return ds.cache().prefetch(buffer_size=AUTOTUNE)


train_ds = prepare(train_ds, shuffle=True, augment=True)
val_ds   = prepare(val_ds)
test_ds   = prepare(test_ds)

# def random_invert_img(x, p=0.5):
#   if  tf.random.uniform([]) < p:
#     x = (255-x)
#   else:
#     x
#   return x

# def random_invert(factor=0.5):
#   return tf.keras.layers.Lambda(lambda x: random_invert_img(x, factor))

# random_invert = random_invert()

# # plt.figure(figsize=(10, 10))
# # for images, _ in train_ds.take(1):
# #   for i in range(9):
# #     augmented_images = random_invert(images)
# #     ax = plt.subplot(3, 3, i + 1)
# #     plt.imshow(augmented_images[0].numpy().astype("uint8"))
# #     plt.axis("off")
# #     plt.show()
















# 모델 훈련
num_classes = 5 
model = tf.keras.Sequential([
    tf.keras.layers.experimental.preprocessing.Rescaling(1./255),
    tf.keras.layers.Conv2D(16, 3, padding='same', activation='relu'),
    tf.keras.layers.MaxPooling2D(),
    tf.keras.layers.Conv2D(32, 3, padding='same', activation='relu'),
    tf.keras.layers.MaxPooling2D(),
    tf.keras.layers.Conv2D(64, 3, padding='same', activation='relu'),
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

# epochs - 하나의 데이터셋을 몇 번 반복 학습할지 정하는 파라미터. 
#          같은 데이터셋이라 할지라도 가중치가 계속해서 업데이트되기 때문에 모델이 추가적으로 학습가능
# model.fit(
#     train_ds,
#     validation_data=val_ds,
#     epochs=1 # 하나의 epochs에 대해서만 학습 (빠른 실행을 위해)
# )

epochs = 1
history = model.fit(
  train_ds,
  validation_data=val_ds,
  epochs=epochs,
  verbose=0
)

# loss, acc = model.evaluate(test_ds)
# print("Accuracy", acc)



# 모델 레이어 보기
model.summary()

# 모델 훈련 후 히스토리 축척
# epochs=10
# history = model.fit(
#     train_ds,
#     validation_data=val_ds,
#     epochs=epochs
# )


# 모델 저장
# model.save('model.h5')
# 이미지 로드 후 분류 하기
# model = load_model('model.h5')

# model.compile(loss='binary_crossentropy',
#              optimizer='rmsprop',
#              metrics=['accuracy'])

img = tf.keras.preprocessing.image.load_img(
    'C:/Users/all4land/Desktop/validatonImg.jpg', target_size=(IMG_SIZE, IMG_SIZE)
)

# img = prepare(img)

img_array = tf.keras.preprocessing.image.img_to_array(img)
img_array = tf.expand_dims(img_array, 0) # Create a batch

predictions = model.predict(img_array)

score = tf.nn.softmax(predictions[0])

print(
    score
)
# print(
#     "This image most likely belongs to {} with a {:.2f} percent confidence."
#     .format(class_names[np.argmax(score)], 100 * np.max(score))
# )







































# #훈련 과정 그래프 표출 
# acc = history.history['accuracy']
# val_acc = history.history['val_accuracy']

# loss = history.history['loss']
# val_loss = history.history['val_loss']

# epochs_range = range(epochs)

# plt.figure(figsize=(8, 8))
# plt.subplot(1, 2, 1)
# plt.plot(epochs_range, acc, label='Training Accuracy')
# plt.plot(epochs_range, val_acc, label='Validation Accuracy')
# plt.legend(loc='lower right')
# plt.title('Training and Validation Accuracy')

# plt.subplot(1, 2, 2)
# plt.plot(epochs_range, loss, label='Training Loss')
# plt.plot(epochs_range, val_loss, label='Validation Loss')
# plt.legend(loc='upper right')
# plt.title('Training and Validation Loss')
# plt.show()