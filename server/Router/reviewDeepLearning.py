import sys

from tensorflow.keras.datasets import imdb
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, GRU, Embedding
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from tensorflow.keras.models import load_model

vocab_size = 100
max_len = 500

(X_train, y_train), (X_test, y_test) = imdb.load_data(num_words=vocab_size)

X_train = pad_sequences(X_train, maxlen=max_len)
X_test = pad_sequences(X_test, maxlen=max_len)


# embedding_dim = 100
# hidden_units = 128

# model = Sequential()
# model.add(Embedding(vocab_size, embedding_dim))
# model.add(GRU(hidden_units))
# model.add(Dense(1, activation='sigmoid'))

# es = EarlyStopping(monitor='val_loss', mode='min', verbose=1, patience=4)
# mc = ModelCheckpoint('GRU_model.h5', monitor='val_acc', mode='max', verbose=1, save_best_only=True)

# model.compile(optimizer='rmsprop', loss='binary_crossentropy', metrics=['acc'])
# history = model.fit(X_train, y_train, epochs=15, callbacks=[es, mc], batch_size=64, validation_split=0.2)

# loaded_model = load_model('GRU_model.h5')
# print("\n 테스트 정확도: %.4f" % (loaded_model.evaluate(X_test, y_test)[1]))





# def sentiment_predict(new_sentence):
#   # 알파벳과 숫자를 제외하고 모두 제거 및 알파벳 소문자화
#   new_sentence = re.sub('[^0-9a-zA-Z ]', '', new_sentence).lower()
#   encoded = []

#   # 띄어쓰기 단위 토큰화 후 정수 인코딩
#   for word in new_sentence.split():
#     try :
#       # 단어 집합의 크기를 10,000으로 제한.
#       if word_to_index[word] <= 10000:
#         encoded.append(word_to_index[word]+3)
#       else:
#       # 10,000 이상의 숫자는 <unk> 토큰으로 변환.
#         encoded.append(2)
#     # 단어 집합에 없는 단어는 <unk> 토큰으로 변환.
#     except KeyError:
#       encoded.append(2)

#   pad_sequence = pad_sequences([encoded], maxlen=max_len)
#   score = float(loaded_model.predict(pad_sequence)) # 예측

#   if(score > 0.5):
#     print("{:.2f}% 확률로 긍정 리뷰입니다.".format(score * 100))
#   else:
#     print("{:.2f}% 확률로 부정 리뷰입니다.".format((1 - score) * 100))








#     sentiment_predict(test_input)
