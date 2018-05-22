from tabula import convert_into
import pandas as pd
import os
import re

URL = 'http://www.nus.edu.sg/registrar/info/ug/UGTuitionCurrent.pdf'
convert_into(URL, 'temp.csv', pages='all')
df = pd.read_csv("temp.csv", header=None, names=range(5))
table_names = ['Per annum amounts', 'Per module amounts']
groups = df[1].isin(table_names).cumsum()

tables = {k: g.iloc[0:] for k,g in df.groupby(groups)}
os.remove('temp.csv')

df = tables[1]
courses = list(df[0][11:25])
courses = [re.sub("[\(\[].*?[\)\]]", "", x) if 'except' in x else x for x in courses]
courses = [re.findall('\((.*?)\)',x)[0] if '(' in x else x for x in courses]
courses = [x.strip() for x in courses]

fees = list(df[1][11:25])
fees = [x.split()[0].replace(',', '') for x in fees]

# Candidature Period URL
URL = 'http://www.nus.edu.sg/registrar/education-at-nus/undergraduate-education/continuation-and-graduation-requirements.html'
df = pd.read_html(URL)
df = df[1]
df.columns = list(range(len(df.columns)))
lstofcourses = list(pd.read_json('NUS_courses.json')[0])
lstofcourses = dict((key, 0) for key in lstofcourses)

# First copy exact match and add in the annual fees
for idx, course in enumerate(courses):
    if course in lstofcourses.keys():
        lstofcourses[course] = fees[idx]

# Then fill in those that have a substring
for idx, course in enumerate(courses):
    for key, value in lstofcourses.items():
        if value == 0 and course in key:
            if 'Computer Science' not in key and 'Data Science' not in key: # the needed exceptions
                lstofcourses[key] = fees[idx]

# Then fill in those weird gaps such as computing and real estate
for idx, course in enumerate(courses):
    for key, value in lstofcourses.items():
        if value == 0 and (course[:5] in key or course[-5:] in key):
            lstofcourses[key] = fees[idx]

# Fill the remaining with the fees of computing
for key, value in lstofcourses.items():
    if value == 0:
        lstofcourses[key] = fees[2]  # Computing is second


print(lstofcourses)
print(df)
print(courses)