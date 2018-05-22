import pandas as pd
import numpy as np

NTU_HOSTEL_URL = 'http://www.ntu.edu.sg/has/Undergraduate/HallsofResidence/Pages/UG_SummaryOfRates.aspx'

df = pd.read_html(NTU_HOSTEL_URL)
fees = list(df[0][3])
fees = fees[1:]
fees_monthly = []
for word in fees:
    word = word.replace("\u200b", '')
    for x in range(0, len(word), 3):
        fees_monthly.append(int(word[x:x + 3]))
fees_monthly = np.array(fees_monthly)
application_fees = float(df[2][1][1]) + float(df[2][1][2])
average_fridge_fees = float(df[2][1][3])
fees_monthly = fees_monthly + application_fees

aircon = ''.join(list(df[0][4][1:]))
aircon_list = []
for idx, each_character in enumerate(aircon):
    if each_character == ',' or each_character == 'A':
        continue
    elif idx + 2 >= len(aircon):
        aircon_list.append(0)
    elif aircon[idx + 1:idx + 3] == ',A':
        aircon_list.append(1)
        if len(aircon_list) < 16*2:
            aircon_list.append(1)
    else:
        aircon_list.append(0)
        if len(aircon_list) < 16*2:
            aircon_list.append(0)

aircon = np.array(aircon_list) * float(df[2][1][5]) * 8 * 60 * 30  # average cost of usage of 8 hours
fees_monthly = fees_monthly + aircon
fees_monthly.sort()
np.save('NTU_hostel_fees.npy', fees_monthly)