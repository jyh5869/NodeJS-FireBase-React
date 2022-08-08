import sys
import re
import base64
import json

from bs4                               import BeautifulSoup
from urllib.parse                      import quote_plus
from selenium                          import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome          import ChromeDriverManager


sys.stdin.reconfigure(encoding='utf-8')
sys.stdout.reconfigure(encoding='utf-8')
# print(sys.stdin.encoding)
# print(sys.stdout.encoding)

keyword = sys.stdin.read()
baseUrl = 'https://www.google.com/search?q='
plusUrl = '꽃 ' + keyword

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
    options.add_argument('--headless')  # 웹 브라우저를 시각적으로 띄우지 않는 headless chrome 옵션
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options) 
    return driver


driver = chromeWebdriver()
driver.get(url)

html = driver.page_source
soup = BeautifulSoup(html)

v1 = soup.select('.I6TXqe')

driver.close()


# 크롤링된 페이지의 특정 선택값 가져오기 및 선택자 없을 경우의 예외처리
def paramException(target, obj):
    
    try:
        if target == "titles":
            returnParam = obj.select('.w8qArf')
        elif  target == "contents":
            returnParam = obj.select('.LrzXr.kno-fv.wHYlTd.z8gr9e')
        elif  target == "name":
            returnParam = obj.select_one('.SPZz6b').h2.text
        elif  target == "category":
            returnParam = obj.select_one('.SPZz6b').div.span.text
        elif  target == "info":
            returnParam = obj.select_one('.PZPZlf.hb8SAc').span.text
        else :    
            returnParam = ""
    except AttributeError as e:
        return None

    return returnParam


for i in v1:
    name     = paramException("name", i )
    category = paramException("category", i )
    info     = paramException("info", i )
    titles   = paramException("titles", i )
    contents = paramException("contents", i )
    
    content_list = []    # 빈 리스트 생성
    title_list   = []

    for a in titles:
        title_list.append(a.a.text)
    
    for j in contents:
        content_list.append(j.text)


    dictionary = dict(zip(title_list, content_list))
    jsonData = json.dumps(dictionary, ensure_ascii=False)


    print(json.dumps({
        'name'       : name    ,
        'category'   : category,
        'info'       : info    ,
        'infoList'   : jsonData, # for문 돌려야함.
    }, 
    ensure_ascii=False)) # 한글이 ascii코드로 바뀌는 문제를 방지하기 위한 옵션 



