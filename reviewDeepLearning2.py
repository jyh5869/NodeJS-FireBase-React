import sys

import re

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import os, time, random
from bs4 import BeautifulSoup
import urllib.request


def chromeWebdriver():
    options = Options()
    options.add_argument("lang=ko_KR")  # 언어 설정
    # options.add_argument("start-maximized") # 창 크기 최대로
    options.add_argument("disable-infobars")
    options.add_argument("--disable-extensions")    
    options.add_experimental_option('detach', True)  # 브라우저 안 닫히게
    options.add_experimental_option('excludeSwitches', ['enable-logging'])  # 시스템 장치 에러 숨기기
    user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36'
    options.add_argument(f'user-agent={user_agent}')    
    # options.add_argument('--headless')  # 웹 브라우저를 시각적으로 띄우지 않는 headless chrome 옵션
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options) 
    return driver


def collect_image(search_word):
    url = 'https://www.google.co.kr'

    now = time.localtime()
    today_time = f'{now.tm_year}{now.tm_mon}{now.tm_mday}_{now.tm_hour}{now.tm_min}{now.tm_sec}'
    print(today_time)

    file_path = "c:\\temp\\"

    os.chdir(file_path)
    os.makedirs(file_path + today_time + '_' + search_word)
    os.chdir(file_path + today_time + '_' + search_word)
    file_save_dir = file_path + today_time + '_' + search_word
    print(file_save_dir)

    driver = chromeWebdriver()
    driver.get(url)
    time.sleep(random.uniform(2, 3))
    elem_q = driver.find_element(By.NAME, 'q')
    elem_q.send_keys(search_word)
    elem_q.submit()

    driver.find_element(By.LINK_TEXT, '이미지').click()  # 텍스트 메뉴 '이미지' 링크 클릭
    # driver.find_element(By.XPATH, '//*[@id="hdtb-msb"]/div[1]/div/div[2]/a').click()
    time.sleep(random.uniform(1, 2))

    file_no = 1
    count = 1
    img_src = []

    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')
    imgs = driver.find_elements(By.CSS_SELECTOR, '#islrg > div.islrc > div a.wXeWr.islib.nfEiy')
    print(len(imgs))

    for img in imgs:
        img_src1 = img.click()  # 이미지 클릭 시 display 되는 url을 찾기 위해 클릭함
        img_src2 = driver.find_element(By.CSS_SELECTOR, '#Sva75c > div > div > div.pxAole > div.tvh9oe.BIB1wf > c-wiz > div > div.OUZ5W > div.zjoqD > div.qdnLaf.isv-id > div > a')
        time.sleep(random.uniform(0.2, 0.5))
        img_src3 = img_src2.find_element(By.TAG_NAME, 'img').get_attribute('src')
        if img_src3[:4] != 'http':
            continue
        print(count, img_src3, '\n')
        img_src.append(img_src3)
        count += 1

    for i in range(len(img_src)):
        extention = img_src[i].split('.')[-1]
        ext = ''
        print(extention)
        if extention in ('jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF'):
            ext = '.' + extention
        else:
            ext = '.jpg'        
        try:
            urllib.request.urlretrieve(img_src[i], str(file_no).zfill(3) + ext)
            print(img_src[i])
        except Exception:
            continue
        file_no += 1
        # time.sleep(random.uniform(0.1, 0.5))
        print(f'{file_no}번째 이미지 저장-----')

    driver.close()


if __name__ == '__main__':
    collect_image('꽃 코스모스')