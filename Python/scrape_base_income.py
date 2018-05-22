from tabula import read_pdf
import pandas as pd

URL = 'https://www.moe.gov.sg/docs/default-source/document/education/post-secondary/files/nus.pdf'

df = read_pdf(URL)
df.dropna(how='all', inplace=True)
print(df)