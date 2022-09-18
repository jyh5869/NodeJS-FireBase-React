import sys
import re
import json

import os, time, random
import firebase_admin # 파이어베이스 클라우드 연동 라이브러리
import urllib.request

from selenium                          import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome          import ChromeDriverManager
from selenium.webdriver.common.by      import By
from selenium.webdriver.common.keys    import Keys
from bs4                               import BeautifulSoup
from firebase_admin                    import credentials
from firebase_admin                    import firestore

# Firebase 연계 초기 세팅
cred = credentials.Certificate('Router/firebase_appKey_Movies.json') # server\Router\firebase_appKey_Movies.json
firebase_admin.initialize_app(cred)

db = firestore.client()

class_list_ref    = db.collection("model_class_list")

# 데이터 조회 1 (조회하고자 하는 영화 데이터 존재 유무 파악)
class_list_query  = class_list_ref.where('use_yn', '==', 'Y').where('train_dt', '==', '') # 개봉일 기준 limit의 레코드 호출 쿼리 작성
class_list_docs   = class_list_query.stream()  # 쿼리 조건에 맞는 데이터 가져오기

class_list_dict   = list(map(lambda x: x.to_dict(), class_list_docs))  # list(Map) 타입으로 데이터 형식 변경 (DataFrame으로 사용하기 위함)

# 이미지데이터 저장 경로
save_path = str(sys.argv[1])

# 업로드 경로 존재 체크 및 생성과 저장경로 세팅
def createDirectory(directory):
    try:
        if not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)

        os.chdir(directory)    
    except OSError:
        return False

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
    driver = webdriver.Chrome(service=Service(executable_path=ChromeDriverManager().install()), options=options)
    return driver


def collect_image(search_word, extract_img_count):
    url = 'https://www.google.co.kr'

    now = time.localtime()
    today_time = f'{now.tm_year}{now.tm_mon}{now.tm_mday}_{now.tm_hour}{now.tm_min}'
    # print(today_time)

    file_path = save_path

    createDirectory(file_path + '/' + search_word)

    file_save_dir = file_path + today_time + '_' + search_word
    # print(file_save_dir)

    driver = chromeWebdriver()
    driver.get(url)
    time.sleep(random.uniform(2, 3))
    elem_q = driver.find_element(By.NAME, 'q')
    elem_q.send_keys(search_word)
    elem_q.submit()

    driver.find_element(By.LINK_TEXT, '이미지').click()  # 텍스트 메뉴 '이미지' 링크 클릭
    # driver.find_element(By.XPATH, '//*[@id="hdtb-msb"]/div[1]/div/div[2]/a').click()
    time.sleep(random.uniform(1, 2))

    # 페이지 스크롤 다운
    def page_scrolling(drivers):
        ## scrolling ------------------------------
        elem = driver.find_element(By.TAG_NAME, 'body')
        page_height = driver.execute_script('return document.body.scrollHeight')
        # print(page_height)

        # more_view_cnt = 0
        scroll_cnt = 1
        more_view_scroll_cnt = -1  # '결과 더보기' 버튼 나올 때의 scroll_cnt (break 처리 위해 사용)
        equal_cnt = 1
        while True:
            elem.send_keys(Keys.PAGE_DOWN)
            time.sleep(random.uniform(0.3, 0.5))
            new_height = driver.execute_script('return document.body.scrollHeight')
            if page_height != new_height:
                page_height = new_height
                equal_cnt = 1
            # print(f'scroll_cnt: {scroll_cnt}, new_height: {new_height}, equal_cnt: {equal_cnt}')
            
            try:
                scroll_cnt += 1
                equal_cnt += 1
                driver.find_element(By.XPATH, '//*[@id="islmp"]/div/div/div/div[1]/div[2]/div[2]/input').click()  # 결과 더보기 버튼 처리
                # print('결과 더보기 버튼 클릭 처리')
                more_view_scroll_cnt = scroll_cnt
                more_view_cnt += 1
            except:
                if equal_cnt == 20:  # scroll_cnt / more_view_scroll_cnt > 2.5:
                    break
                continue
        ## End of scrolling ------------------------------

    page_scrolling(driver)

    file_no = 1
    count = 1
    img_src = []

    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')
    # print(soup)
    # imgs = driver.find_elements(By.TAG_NAME, 'img')
    imgs = driver.find_elements(By.CSS_SELECTOR, '#islrg > div.islrc > div a.wXeWr.islib.nfEiy')
    # print(len(imgs))

    for img in imgs:
        img_src1 = img.click()  # 이미지 클릭 시 display 되는 url을 찾기 위해 클릭함
        try:
            img_src2 = driver.find_element(By.CSS_SELECTOR, '#Sva75c > div > div > div.pxAole > div.tvh9oe.BIB1wf > c-wiz > div > div.OUZ5W > div.zjoqD > div.qdnLaf.isv-id > div > a')
        except Exception:
            continue
        time.sleep(random.uniform(0.2, 0.5))
        img_src3 = img_src2.find_element(By.TAG_NAME, 'img').get_attribute('src')
        if img_src3[:4] != 'http':
            continue
        # print(count, img_src3, '\n')

        img_src.append(img_src3)
        if count == extract_img_count + 10:  # 이미지 에러 대비해서 입력 숫자보다 크게 잡음
            break        
        count += 1
        
    # print(f'\n{"="*10} 추출한 전체 리스트 {"="*10}\n{img_src}\n\n{"="*10}총 {len(img_src)}개 추출함{"="*10}\n')

    for i in range(len(img_src)):
        extention = img_src[i].split('.')[-1]
        ext = ''
        if extention in ('jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF'):
            ext = '.' + extention
        else:
            ext = '.jpg'        
        try:
            urllib.request.urlretrieve(img_src[i], str(file_no).zfill(3) + ext)
            print(img_src[i])
        except Exception:
            continue

        # print(f'{file_no}번째 이미지 저장-----')
        file_no += 1
        
        if file_no - 1 == extract_img_count:
            break

    driver.close()


# 훈련이 안된 클래스를 반복하며 크롤링 데이터 생성
for key in class_list_dict:
    # 현재시간을 서버 표준 시간으로 세팅
    train_dt = int(str(time.time()).replace('.','')[0:13])

    # 크롤링 진행
    collect_image(key['class_kor_nm'], 50)
    
    # 트레이닝 날짜 업데이트
    class_list_ref.document(key['id']).set({
        u'train_dt': train_dt
    }, merge = True)
