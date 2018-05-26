from fastkml import kml
import pandas as pd
import pickle
from selenium.webdriver import Chrome
from selenium.webdriver.common.keys import Keys
import time
import keyboard

WEBDRIVER_PATH = '../uni/chromedriver'
kml_file = 'version0.04.kml'
with open(kml_file, 'rt', encoding="utf-8") as myfile:
    doc=myfile.read().encode('utf-8')

# doc = doc.split('\n')

k = kml.KML()
k.from_string(doc)

features = list(k.features())
# print(len(features))

f2 = list(features[0].features())
# print(len(f2))
# print(f2[0].name)

f3 = list(f2[0].features())
# print(len(f3))
lst = []
for idx, _ in enumerate(f3):
    # print(f3[idx].name)
    lst.append(f3[idx].name)


PATH_FILE = '../room_types/All.json'
df = pd.read_json(PATH_FILE)
df = list(df[0])[:-1]
# print(len(df))

no_location = []
for location in df:
    if location.upper() not in lst:
        # print(location)
        no_location.append(location)

# print(len(no_location))
mydict = {}

URL = 'https://www.gps-coordinates.net/'
browser = Chrome(WEBDRIVER_PATH)
browser.get(URL)
for location in df:
    browser.find_element_by_id('address').click()
    time.sleep(2)
    keyboard.press_and_release('ctrl+a, delete')
    keyboard.write(location + " Singapore")
    keyboard.press('down')
    time.sleep(0.3)
    keyboard.release('down')
    keyboard.press('down')
    time.sleep(0.3)
    keyboard.release('down')
    keyboard.press('enter')
    time.sleep(0.3)
    keyboard.release('enter')
    browser.find_element_by_class_name('btn-primary').click()

    mydict[location] = browser.find_element_by_id('info_window').get_attribute("innerHTML")
    print(location)

with open('places.p', 'wb') as f:
    pickle.dump(mydict, f)

# keyboard.press('down')

# keyboard.press_and_release('down, enter')
# keyboard.press('down')

# for _ in range(20):
#     browser.find_element_by_id('address').send_keys(Keys.DELETE)



# browser.find_element_by_id('address').send_keys(Keys.CONTROL + "a" +Keys.DELETE)
# browser.find_element_by_id('address').clear()
