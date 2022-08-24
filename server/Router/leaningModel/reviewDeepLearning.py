import sys
import re
import base64 # 인코딩

import os     # 텐서플로 사용을 위해 필요한 오브젝트
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# from tensorflow.keras import keras
from tensorflow.keras.datasets import imdb

import tensorflow as tf
from tensorflow import keras

import numpy as np

import matplotlib.pyplot as plt # 트레이닝 과정을 보기 위한 그래프 라이브러리

from tensorflow.keras.preprocessing.sequence import pad_sequences
# from tensorflow.keras.models import Sequential
# from tensorflow.keras.layers import Dense, GRU, Embedding
# from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
# from tensorflow.keras.models import load_model
# 참조링크  : https://www.tensorflow.org/tutorials/keras/text_classification?hl=ko




imdb = keras.datasets.imdb
(train_data, train_labels), (test_data, test_labels) = imdb.load_data(num_words=10000)
# print("훈련 샘플: {}, 레이블: {}".format(len(train_data), len(train_labels)))

print(train_data[0])

# 단어와 정수 인덱스를 매핑한 딕셔너리
word_index = imdb.get_word_index()

# 처음 몇 개 인덱스는 사전에 정의되어 있습니다
word_index = {k:(v+3) for k,v in word_index.items()}
word_index["<PAD>"] = 0
word_index["<START>"] = 1
word_index["<UNK>"] = 2  # unknown
word_index["<UNUSED>"] = 3

reverse_word_index = dict([(value, key) for (key, value) in word_index.items()])

def decode_review(text):
    return ' '.join([reverse_word_index.get(i, '?') for i in text])

print(decode_review(train_data[0])) 

train_data = keras.preprocessing.sequence.pad_sequences(train_data,
                                                        value=word_index["<PAD>"],
                                                        padding='post',
                                                        maxlen=256)

test_data = keras.preprocessing.sequence.pad_sequences(test_data,
                                                       value=word_index["<PAD>"],
                                                       padding='post',
                                                       maxlen=256)


# print(len(train_data[0]), len(train_data[1]))
print(print(train_data[0]))


# 입력 크기는 영화 리뷰 데이터셋에 적용된 어휘 사전의 크기입니다(10,000개의 단어)
vocab_size = 10000

model = keras.Sequential()
model.add(keras.layers.Embedding(vocab_size, 16, input_shape=(None,)))
model.add(keras.layers.GlobalAveragePooling1D())
model.add(keras.layers.Dense(16, activation='relu'))
model.add(keras.layers.Dense(1, activation='sigmoid'))

print(model.summary())


model.compile(optimizer='adam',
              loss='binary_crossentropy',
              metrics=['accuracy', 'binary_crossentropy'])



x_val = train_data[:10000]
partial_x_train = train_data[10000:]

y_val = train_labels[:10000]
partial_y_train = train_labels[10000:]


# 1. verbose = 0 : 로깅하지않음  2. verbose = 1이상 : 0보다 클수록 상세하게 로깅을 프린트함 ( 로깅은 처리속도 저하에 영향을 끼침 )
model.fit(partial_x_train,
                     partial_y_train,
                     epochs=20,
                     batch_size=512,
                     validation_data=(x_val, y_val),
                     verbose=0)


# 테스트 데이터를 통한 모델 평가 (result 에 정확도 반환)
results = model.evaluate(test_data,  test_labels, verbose=0)
print(results)
 


max_len = 256
def sentiment_predict(new_sentence):
  # 알파벳과 숫자를 제외하고 모두 제거 및 알파벳 소문자화
  # new_sentence = re.sub('[^0-9a-zA-Z ]', '', new_sentence).lower()
  encoded = []

  # 띄어쓰기 단위 토큰화 후 정수 인코딩
  for word in new_sentence.split():
    try :
      # 단어 집합의 크기를 10,000으로 제한.
      if word_index[word] <= 10000:
        # encoded.append(word_index[word]+3)
        encoded.append(word_index[word])
      else:
      # 10,000 이상의 숫자는 <unk> 토큰으로 변환.
        encoded.append(2)
      #encoded.append(word_index[word])
    # 단어 집합에 없는 단어는 <unk> 토큰으로 변환.
    except KeyError:
      encoded.append(2)



  test_data = pad_sequences([encoded],
                value=word_index["<PAD>"],
                padding='post',
                maxlen=256)

  

  pad_sequence = pad_sequences([encoded], maxlen=max_len)
  score = float(model.predict(pad_sequence)) # 예측

  print(new_sentence)
  print(encoded)
  print(test_data)
  print(pad_sequence) 

  print(score)



  if(score > 0.5): 
    print(base64.b64encode(("{:.2f}% 확률로 긍정적 리뷰 입니다.(Positive)".format(score * 100)).encode('utf-8')))
  else:   
    print(base64.b64encode(("{:.2f}% 확률로 부정적 리뷰 입니다.(Positive)".format((1 - score) * 100)).encode('utf-8')))


# 부정 리뷰
# test_input = "<START> This movie was just way too overrated. The fighting was not professional and in slow motion. I was expecting more from a 200 million budget movie. The little sister of T.Challa was just trying too hard to be funny. The story was really dumb as well. Don't watch this movie if you are going because others say its great unless you are a Black Panther fan or Marvels fan."

test_input = "<START> This movie wasn't good. Just don't look no fun and it's the worst"


# 긍정리뷰
# test_input = "<START> I was lucky enough to be included in the group to see the advanced screening in Melbourne on the 15th of April, 2012. And, firstly, I need to say a big thank-you to Disney and Marvel Studios. Now, the film... how can I even begin to explain how I feel about this film? It is, as the title of this review says a 'comic book triumph'. I went into the film with very, very high expectations and I was not disappointed. Seeing Joss Whedon's direction and envisioning of the film come to life on the big screen is perfect. The script is amazingly detailed and laced with sharp wit a humor. The special effects are literally mind-blowing and the action scenes are both hard-hitting and beautifully choreographed."

# test_input ="<START> This movie was so much fun. The acting of the actors was impressive, and although there were some shortcomings, I think it was a very good movie time. I recommend it."

# test_input = "<START> this film was just brilliant casting location scenery story direction everyone's really suited the part they played and you could just imagine being there robert <UNK> is an amazing actor and now the same being director <UNK> father came from the same scottish island as myself so i loved the fact there was a real connection with this film the witty remarks throughout the film were great it was just brilliant so much that i bought the film as soon as it was released for <UNK> and would recommend it to everyone to watch and the fly fishing was amazing really cried at the end it was so sad and you know what they say if you cry at a film it must have been good and this definitely was also <UNK> to the two little boy's that played the <UNK> of norman and paul they were just brilliant children are often left out of the <UNK> list i think because the stars that play them all grown up are such a big profile for the whole film but these children are amazing and should be praised for what they have done don't you think the whole story was so lovely because it was true and was someone's life after all that was shared with us all"

sentiment_predict(test_input)





















# history = model.fit(partial_x_train,
#                     partial_y_train,
#                     epochs=40,
#                     batch_size=512,
#                     validation_data=(x_val, y_val),
#                     verbose=1)

# print(history)

# history_dict = history.history
# history_dict.keys()


# import matplotlib.pyplot as plt

# acc = history_dict['accuracy']
# val_acc = history_dict['val_accuracy']
# loss = history_dict['loss']
# val_loss = history_dict['val_loss']

# epochs = range(1, len(acc) + 1)

# # "bo"는 "파란색 점"입니다
# plt.plot(epochs, loss, 'bo', label='Training loss')
# # b는 "파란 실선"입니다
# plt.plot(epochs, val_loss, 'b', label='Validation loss')
# plt.title('Training and validation loss')
# plt.xlabel('Epochs')
# plt.ylabel('Loss')
# plt.legend()

# plt.show()

# plt.clf()   # 그림을 초기화합니다

# plt.plot(epochs, acc, 'bo', label='Training acc')
# plt.plot(epochs, val_acc, 'b', label='Validation acc')
# plt.title('Training and validation accuracy')
# plt.xlabel('Epochs')
# plt.ylabel('Accuracy')
# plt.legend()

# plt.show()