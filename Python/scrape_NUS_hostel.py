import pandas as pd
import numpy as np
from selenium.webdriver import Chrome
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import requests

WEBDRIVER_PATH = 'chromedriver'
NUS_HOSTEL_URL = 'http://www.nus.edu.sg/osa/housing/non-graduating/hostel-and-meal-plan-rates.html'

browser = Chrome(WEBDRIVER_PATH)
browser.get(NUS_HOSTEL_URL)
time.sleep(3)
# try:
#     element = WebDriverWait(browser, 10).until(
#         EC.presence_of_element_located((By.ID, 'ui-id-1'))
#     )
# except:
#     pass
browser.find_element_by_id('ui-id-1').click()
html = browser.page_source
dfmain = pd.read_html(html)
browser.quit()

# Hall Fees
df = dfmain[0]
#  the table extracted is fked up so change up abit
long_lst = np.array([])
for each_lst in np.array(df):
    long_lst = np.append(long_lst, each_lst)

Weekly_fees_hall = []
for idx, word in enumerate(long_lst):
    if 'Single' in str(word) or 'Double' in str(word):
        Weekly_fees_hall.append(long_lst[idx+2])
Weekly_fees_hall = np.array([float(x.replace('$', '').replace(',', '').replace('S', '')) for x in Weekly_fees_hall])
Monthly_fees_hall = Weekly_fees_hall * 4

# Hall Food
df = dfmain[3]
df.columns = list(range(len(df.columns)))
Weekly_fees_hall_food = np.array([float(x.split('$')[1].replace(',', '')) for x in df[2]])
Monthly_fees_hall_food = Weekly_fees_hall_food / 17
Monthly_fees_hall += Monthly_fees_hall_food

# Residential College
df = dfmain[2]
#  the table extracted is fked up so change up abit
long_lst = np.array([])
for each_lst in np.array(df):
    long_lst = np.append(long_lst, each_lst)

Weekly_fees_college = []
for idx, word in enumerate(long_lst):
    if 'Single' in str(word) or 'Double' in str(word):
        Weekly_fees_college.append(long_lst[idx+2])
Weekly_fees_college = np.array([float(x.replace('$', '').replace(',', '').replace('S', '')) for x in Weekly_fees_college])
Monthly_fees_college = Weekly_fees_college * 4


# College Food
df = dfmain[1]
df.columns = list(range(len(df.columns)))
Weekly_fees_college_food = np.array([float(x.split('$')[1].replace(',', '')) for x in df[2]])
Monthly_fees_college_food = Weekly_fees_college_food / 17
Monthly_fees_college += Monthly_fees_college_food

Monthly_fees_hall = np.append(Monthly_fees_hall, Monthly_fees_college)
Monthly_fees_hall.sort()
np.save('NUS_hostel_fees.npy', Monthly_fees_hall)
