
import sys
import re
import os

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
# https://machinelearningmastery.com/image-augmentation-with-keras-preprocessing-layers-and-tf-image/

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

dn_url = 'C:/Users/all4land/.keras/datasets/animalSound/'
#tesorflow_io
yamnet_model_handle = 'https://tfhub.dev/google/yamnet/1'
yamnet_model = hub.load(yamnet_model_handle)

print(yamnet_model)

testing_wav_file_name = tf.keras.utils.get_file('miaow_16k.wav',
                                                'https://storage.googleapis.com/audioset/miaow_16k.wav',
                                                cache_dir=dn_url,
                                                cache_subdir='test_data')

print(testing_wav_file_name)



def load_wav_16k_mono(filename):
    """ Load a WAV file, convert it to a float tensor, resample to 16 kHz single-channel audio. """
    file_contents = tf.io.read_file(filename)
    wav, sample_rate = tf.audio.decode_wav(
          file_contents,
          desired_channels=1)
    wav = tf.squeeze(wav, axis=-1)
    sample_rate = tf.cast(sample_rate, dtype=tf.int64)
    wav = tfio.audio.resample(wav, rate_in=sample_rate, rate_out=16000)
    return wav

testing_wav_data = load_wav_16k_mono(testing_wav_file_name)

plt.plot(testing_wav_data)
plt.show()
# Play the audio file.
display.Audio(testing_wav_data,rate=16000)





class_map_path = yamnet_model.class_map_path().numpy().decode('utf-8')
class_names =list(pd.read_csv(class_map_path)['display_name'])
print(len(class_map_path))
for name in class_names[:20]:
  print(name)
print('...')



scores, embeddings, spectrogram = yamnet_model(testing_wav_data)
class_scores = tf.reduce_mean(scores, axis=0)
top_class = tf.argmax(class_scores)
inferred_class = class_names[top_class]

print(f'The main sound is: {inferred_class}')
print(f'The embeddings shape: {embeddings.shape}')


tf.keras.utils.get_file('esc-50.zip',
                        'https://github.com/karoldvl/ESC-50/archive/master.zip',
                        cache_dir=dn_url,
                        cache_subdir='datasets',
                        extract=True)




# esc50_csv = dn_url +'datasets/ESC-50-master/meta/esc50.csv'
# base_data_path = dn_url + 'datasets/ESC-50-master/audio/'

# pd_data = pd.read_csv(esc50_csv)
# pd_data.head()