import pandas as pd
import numpy as np
from selenium.webdriver import Chrome
from bs4 import BeautifulSoup as bs
import requests

# Oops, scraped the wrong website, this is hostel for international student
# SMU_HOSTEL_URL = 'http://www.dwellstudent.com.sg/en/selegie-room-rates/'
#
# html = bs(requests.get(SMU_HOSTEL_URL).text, 'html.parser')
# html = html.findAll('div', {'class': 'fusion-column-wrapper'})
# html = html[3:]
# amount_array = []
# for x in range(0, len(html)-1, 2):
#     amount = html[x].find('strong')
#     amount = amount.text.split(' ')
#     amount = amount[0].replace('S$', '').replace(',', '')
#     amount_array.append(float(amount))

# Prinsep Street Residences (PSR) SMU

WEBDRIVER_PATH = 'chromedriver'
SMU_HOSTEL_URL = 'https://smusg.asia.qualtrics.com/jfe/form/SV_bgyDVxAjtsZxFZP'

html = bs(requests.get(SMU_HOSTEL_URL).text, 'html.parser')
html = html.text
key_deposit_fee = float(html.split('key deposit of $')[1].split(' ')[0])
registration_fee = float(html.split('registration fee of $')[1].split('.')[0])

html_rental = html.split('">')
html_rental = [x for x in html_rental if '$' in x[:7]]
html_rental = [x.split('</td>')[0] for x in html_rental]
html_rental = html_rental[:16]
rental_fees = [float(x.replace(',', '').replace('$', '')) for x in html_rental]
rental_fees = rental_fees[:-8]  # only want the one year and use to calculate each month
utilities_fees = np.array(rental_fees[-4:])
rental_fees = np.array(rental_fees[:4])
total_fees = utilities_fees + rental_fees
total_fees = (total_fees + key_deposit_fee + registration_fee) / 11  # to get per month
# print(total_fees)

# YO:HA HOSTEL @ PEARL'S HILL SMU
SMU_HOSTEL_URL = 'https://www.smu.edu.sg/campus-life/facilities-leasing/student-facilities/yo-ha-hostel-pearls-hill'
browser = Chrome(WEBDRIVER_PATH)
browser.get(SMU_HOSTEL_URL)
browser.find_element_by_link_text('Room Rates').click()
html = browser.page_source
df = pd.read_html(html)
df = df[0]
browser.quit()

accomodation_charges = np.array([float(x.replace('$', '').replace(',','')) for x in df[1][1:]])
utility_charges = np.array([float(x.replace('$', '').replace(',','')) for x in df[2][1:]])
admin_charges = np.array([float(x.replace('$', '').replace(',','')) for x in df[3][1:]])
charges = accomodation_charges + utility_charges + admin_charges


# Combine both hostel into one common array
total_fees = np.append(total_fees, charges)

total_fees.sort()
np.save('SMU_hostel_fees.npy', total_fees)
