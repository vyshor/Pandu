from tabula import convert_into
import pandas as pd
import os

URL = 'http://www.nus.edu.sg/registrar/info/ug/UGTuitionCurrent.pdf'
convert_into(URL, 'temp.csv', pages='all')
df = pd.read_csv("temp.csv", header=None, names=range(5))
table_names = ['Per annum amounts', 'Per module amounts']
groups = df[1].isin(table_names).cumsum()
print(groups)
tables = {g.iloc[0,0]: g.iloc[1:] for k,g in df.groupby(groups)}
os.remove('temp.csv')
# print(df)