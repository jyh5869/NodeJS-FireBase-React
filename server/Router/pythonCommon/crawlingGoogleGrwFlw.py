import sys
import re

# import base64 # 인코딩
import json

from urllib.parse import quote_plus
from bs4 import BeautifulSoup
from selenium import webdriver

from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

from webdriver_manager.chrome import ChromeDriverManager
# driver = webdriver.Chrome('C:/Users/all4land/Desktop/NodeJS-FireBase-React/server/Router/pythonCommon/library/chromedriver.exe')
# driver = webdriver.Chrome('C:/Users/all4land/Desktop/chromedriver.exe')

sys.stdin.reconfigure(encoding='utf-8')
sys.stdout.reconfigure(encoding='utf-8')
# print(sys.stdin.encoding)
# print(sys.stdout.encoding)

# keyword = sys.args[0]
keyword = sys.stdin.read()
baseUrl = 'https://www.google.com/search?q='
plusUrl = keyword + ' 관리'

url = baseUrl + quote_plus(plusUrl)


def chromeWebdriver():
    options = Options()
    options.add_argument("lang=ko_KR")  # 언어 설정
    options.add_argument("start-maximized") # 창 크기 최대로
    options.add_argument("disable-infobars")
    options.add_argument("--disable-extensions")    
    options.add_experimental_option('detach', True)  # 브라우저 안 닫히게
    options.add_experimental_option('excludeSwitches', ['enable-logging'])  # 시스템 장치 에러 숨기기
    user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36'
    options.add_argument(f'user-agent={user_agent}')    
    # options.add_argument('--headless')  # 웹 브라우저를 시각적으로 띄우지 않는 headless chrome 옵션
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options) 
    return driver


driver = chromeWebdriver()
driver.get(url)

html = driver.page_source
soup = BeautifulSoup(html)

v1 = soup.select('.jtfYYd.UK95Uc')

result_list = []

for i in v1:

    # 검색결과 JSON데이터 생성
    obj_search_res = json.dumps({
            # 'searchRes' : {
                'title'     : i.h3.text,
                'url'       : i.select_one('.yuRUbf').a.attrs['href'],
                'contents'  : i.select_one('.VwiC3b.yXK7lf.MUxGbd.yDYNvb.lyLwlc.lEBKkf').text, # for문 돌려야함.
            # }
        }, 
        ensure_ascii=False) # 한글이 ascii코드로 바뀌는 문제를 방지하기 위한 옵션

    result_list.append(obj_search_res)

    # result_list['result'] = obj_search_res
    
    # result_json = ','.join(result_list)


# # 배열을 딕셔너리로 바꿔 리턴 
# res = {(i + 1): result_list[i] for i in range(0, len(result_list))}
# jsonData = json.dumps(res ,ensure_ascii=False)
# print(jsonData)

# # 배열을 JSON문자열로 바꿔 리턴
print( json.dumps(result_list, ensure_ascii=False))

# # 배열을 그대로 리턴
# print( result_list)

# 자료형 타입
# print(type(v))

# for i in v1:
    # print("하위하위")
    # print(i.select_one('.LC20lb.DKV0Md').text)
    # print(i.a.attrs['href'])
    # print(i.h2.text)
    # print(i.div.span.text)

    # titles    = i.select('.w8qArf')
    # contents = i.select('.LrzXr.kno-fv.wHYlTd.z8gr9e')

    # content_list = []    # 빈 리스트 생성
    # title_list   = []

    # for a in titles:
    #     title_list.append(a.a.text)
    #     # print(a.text)
    
    # for j in contents:
    #     content_list.append(j.text)
    #     # print(j.text)


    # dictionary = dict(zip(title_list, content_list))
    # jsonData = json.dumps(dictionary, ensure_ascii=False)
    # print(jsonData)

    # print(json.dumps({
    #     'name'       : i.select_one('.SPZz6b').h2.text,
    #     'category'   : i.select_one('.SPZz6b').div.span.text,
    #     'info'       : i.select_one('.PZPZlf.hb8SAc').span.text,
    #     'infoList'   : jsonData, # for문 돌려야함.
    # }, 
    # ensure_ascii=False)) # 한글이 ascii코드로 바뀌는 문제를 방지하기 위한 옵션 



driver.close()