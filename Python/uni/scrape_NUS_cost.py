from tabula import convert_into, read_pdf
import pandas as pd
import statistics as stats
import os
import re
import sqlite3
import json
import codecs

URL = 'http://www.nus.edu.sg/registrar/info/ug/UGTuitionCurrent.pdf'
convert_into(URL, 'temp.csv', pages='all')
# exit() # there seems to be a bug that the csv is only generated when the process finished.
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


# # Scrape the Sqlite idea
# conn = sqlite3.connect('course_info.sqlite')
# c = conn.cursor()
#
#
# def create_table():
#     c.execute('CREATE TABLE IF NOT EXISTS courseInfo (uni TEXT, course TEXT, cost REAL)')
#
#
# def data_entry(uni, course, cost):
#     c.execute('INSERT INTO courseInfo VALUES(\"{}\", \"{}\", \"{}\")'.format(uni, course, cost))
#     conn.commit()
#
#
#
# create_table()
# for course, cost in lstofcourses.items():
#     data_entry('NUS', course, cost)
# c.close()
# conn.close()

for course, cost in lstofcourses.items():
    lstofcourses[course] = {}
    lstofcourses[course]['cost'] = cost

Salary_URL = 'https://www.moe.gov.sg/docs/default-source/document/education/post-secondary/files/nus.pdf'

convert_into(Salary_URL, 'temp2.csv', pages='all')
df = pd.read_csv("temp2.csv", header=None, names=range(10))

# Get all the course names first with Bachelor
names_course = list(df[0])
names_course = [x for x in names_course if str(x) != 'nan']
names_course = ''.join(names_course).split('Bachelor')
names_course = ['Bachelor' + x for x in names_course[1:]]
names_course = [x for x in names_course if'Surgery6' not in x]  # the only customisation I made
# names_course = [x for x in names_course if 'Hon' not in x]


# Get all the median income, take note, this
median_income = list(df[5])
median_income = [x for x in median_income if str(x) != 'nan']
median_income = [x for x in median_income if '$' in x or 'N.A' in x]

mydict = dict(zip(names_course, median_income))
keys = list(mydict.keys())
for key in keys:
    if 'Hon' in key:
        del mydict[key]
    else:
        mydict[key] = mydict[key].split()[0].replace(',','').replace('$','')


# First check for exact match
for key, _ in lstofcourses.items():
    for keyB in mydict.keys():
        if key in keyB:
            lstofcourses[key]['median_salary'] = mydict[keyB]

# Then check for substring using first substring
for key, _ in lstofcourses.items():
    for keyB in mydict.keys():
        if key.split()[0] in keyB and 'median_salary' not in lstofcourses[key].keys():
            lstofcourses[key]['median_salary'] = mydict[keyB]

# Then check for substring using last substring
for key, _ in lstofcourses.items():
    for keyB in mydict.keys():
        if key.split()[-1] in keyB and 'median_salary' not in lstofcourses[key].keys():
            lstofcourses[key]['median_salary'] = mydict[keyB]

median_mean = round(stats.mean([float(x.replace('$', '').replace(',','').split()[0]) for x in median_income if 'N.A' not in x]), -2)
for key, _ in lstofcourses.items():
    if 'median_salary' not in lstofcourses[key].keys():
        lstofcourses[key]['median_salary'] = median_mean

duration_URL = 'http://www.nus.edu.sg/registrar/education-at-nus/undergraduate-education/continuation-and-graduation-requirements.html'

df = pd.read_html(duration_URL)
df = df[1]
df.columns = list(range(len(df.columns)))

duration = list(df[2])
duration = [str(int(float(x.split()[0])/2)) for x in duration] # Using integer, so that it looks nicer, but if next time, theres decimal should return in float format instead.
courses = list(df[1])

for key in lstofcourses.keys():
    for idx, course_cat in enumerate(courses):
        if key.lower().replace(' ','').replace('and', '&') in course_cat.lower().replace(' ','').replace('and', '&'):
            lstofcourses[key]['duration'] = duration[idx]

for key in lstofcourses.keys():
    if 'duration' not in lstofcourses[key].keys():
        lstofcourses[key]['duration'] = '4'  # Cus I got no idea why their years not on the website

json.dump(lstofcourses, codecs.open('NUS_cost_salary.json', 'w', encoding='utf-8'), sort_keys=True, indent=4)


# print(df)
# print(courses)
# print(lstofcourses.keys())