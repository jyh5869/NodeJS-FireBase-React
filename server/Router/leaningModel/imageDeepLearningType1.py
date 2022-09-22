import sys
import re
import base64 # 인코딩


import numpy as np
import cv2
import os

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import PIL
import PIL.Image
import tensorflow as tf
import tensorflow_datasets as tfds



import matplotlib.pyplot as plt # 이미지 표출을 위한 LIB
import pathlib

# TENSOR VERSION
print(tf.__version__)

(train_ds, val_ds, test_ds), metadata = tfds.load(
    'tf_flowers',
    split=['train[:80%]', 'train[80%:90%]', 'train[90%:]'],
    with_info=True,
    as_supervised=True,
)

# 클레스 갯수와 각 라벨을 추출
num_classes = metadata.features['label']
label_name = metadata.features['label'].int2str
print(num_classes)
print(label_name)

# # 데이터 시각화 (트레이닝 데이터 이미지를 호출하여 화면에 띄운다.)
image, label = next(iter(train_ds))
# plt.imshow(image)
# plt.title(label_name(label))
# plt.show()


IMG_SIZE = 180
batch_size = 32

# 데이터 증강 1-1 : 배율 및 크기조정
resize_and_rescale = tf.keras.Sequential([
  tf.keras.layers.experimental.preprocessing.Resizing(IMG_SIZE, IMG_SIZE),
  tf.keras.layers.experimental.preprocessing.Rescaling(1./255) 
  # RGB 채널 값 [0, 255] ( 신경망에 이상적이지 않습니다. 일반적으로 입력 값을 작게 만들어야 한다.) ->  [0, 1] 범위에 있도록 표준화 
])

# 데이터 증강 2-1 : 이미지 플립
data_augmentation1 = tf.keras.Sequential([
  tf.keras.layers.experimental.preprocessing.RandomFlip("horizontal_and_vertical"),
  tf.keras.layers.experimental.preprocessing.RandomRotation(0.2),
])

# 데이터 증강 2-2 : 이미지 플립
data_augmentation2 = tf.keras.Sequential(
  [
    tf.keras.layers.experimental.preprocessing.RandomFlip("horizontal", 
                                                 input_shape=(IMG_SIZE, 
                                                              IMG_SIZE,
                                                              3)),
    tf.keras.layers.experimental.preprocessing.RandomRotation(0.1),
    tf.keras.layers.experimental.preprocessing.RandomZoom(0.1),
  ]
)


def random_invert_img(x, p=0.5):
  if  tf.random.uniform([]) < p:
    x = (255-x)
  else:
    x
  return x

def random_invert(factor=0.5):
  return tf.keras.layers.Lambda(lambda x: random_invert_img(x, factor))

random_invert = random_invert()


# image = tf.expand_dims(image, 0)
# plt.figure(figsize=(10, 10))
# for i in range(9):
#   augmented_image = data_augmentation1(image)
#   augmented_image = random_invert(augmented_image)
  
#   ax = plt.subplot(3, 3, i + 1)
#   plt.imshow(augmented_image[0].numpy().astype("uint8"))
#   plt.axis("off")
#   plt.show()




AUTOTUNE = tf.data.AUTOTUNE
# 데이터세트에 전처리 레이어 적용하기 1(Accuracy =  0.4550408720970154)

def prepare(ds, shuffle=False, augment=False):
  ds = ds.map(lambda x, y: (random_invert_img(x), y), num_parallel_calls=AUTOTUNE)

  # Resize and rescale all datasets
  ds = ds.map(lambda x, y: (resize_and_rescale(x), y), num_parallel_calls=AUTOTUNE)
  
  if shuffle:
    ds = ds.shuffle(1000)

  # Batch all datasets
  ds = ds.batch(batch_size)

  # Use data augmentation only on the training set
  if augment:
    ds = ds.map(lambda x, y: (data_augmentation2(x, training=True), y), 
                num_parallel_calls=AUTOTUNE)

  # Use buffered prefecting on all datasets
  return ds.cache().prefetch(buffer_size=AUTOTUNE)


train_ds = prepare(train_ds, shuffle=True, augment=True)
val_ds   = prepare(val_ds)
test_ds  = prepare(test_ds)





# # 데이터세트에 전처리 레이어 적용하기 방법 2 ( Accuracy =  0.42506811022758484" )
# def resize_and_rescale(image, label):
#   image = tf.cast(image, tf.float32)
#   image = tf.image.resize(image, [IMG_SIZE, IMG_SIZE])
#   image = (image / 255.0)
#   return image, label

# def augment(image,label):

#   image = random_invert_img(image)
  
#   image, label = resize_and_rescale(image, label)
#   # Add 6 pixels of padding
#   image = tf.image.resize_with_crop_or_pad(image, IMG_SIZE + 6, IMG_SIZE + 6) 
#    # Random crop back to the original size
#   image = tf.image.random_crop(image, size=[IMG_SIZE, IMG_SIZE, 3])
#   image = tf.image.random_brightness(image, max_delta=0.5) # Random brightness
#   image = tf.clip_by_value(image, 0, 1)
  

#   return image, label

# train_ds = (
#     train_ds
#     .shuffle(1000)
#     .map(augment, num_parallel_calls=AUTOTUNE)
#     .batch(batch_size)
#     .prefetch(AUTOTUNE)
# )

# val_ds = (
#     val_ds
#     .map(resize_and_rescale, num_parallel_calls=AUTOTUNE)
#     .batch(batch_size)
#     .prefetch(AUTOTUNE)
# )

# test_ds = (
#     test_ds
#     .map(resize_and_rescale, num_parallel_calls=AUTOTUNE)
#     .batch(batch_size)
#     .prefetch(AUTOTUNE)
# )









# 베치 쉐입 확인 
for image_batch, labels_batch in train_ds:
  print(image_batch.shape)
  print(labels_batch.shape)
  break


# 모델 훈련 하기
num_classes = 5 
model = tf.keras.Sequential([
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
epochs = 2
history = model.fit(
  train_ds,
  validation_data=val_ds,
  epochs=epochs,
  verbose=0
)

loss, acc = model.evaluate(test_ds)
print("Accuracy = ", acc)


# 모델 레이어 보기
model.summary()


# 모델 저장 및 로드 하기 
# model.save('model.h5.flower2')
# model = load_model('model.h5')

# model.compile(loss='binary_crossentropy',
#              optimizer='rmsprop',
#              metrics=['accuracy'])

img_url = [
  'C:/Users/all4land/Desktop/validatonImg.jpg',
  'C:/Users/all4land/Desktop/validatonImg2.jpg',
  'C:/Users/all4land/Desktop/validatonImg3.jpg',
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
      .format(label_name(np.argmax(score)), 100 * np.max(score))
  )


# # 훈련 과정 그래프 보기 
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