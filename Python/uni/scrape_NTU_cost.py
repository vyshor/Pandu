import pandas as pd
from tabula import convert_into, read_pdf
import statistics as stats
import json
import codecs

URL = 'http://www.ntu.edu.sg/NSS/NSSFinance/FeesTuitionGrant/Pages/tf_18.aspx'

df = pd.read_html(URL)
df = df[0]

courses = list(df[0][2:])
cost = list(df[1][2:])
cost = [x.replace('S', '').replace('$', '').replace(',', '') for x in cost]


df = list(pd.read_json('NTU_courses.json')[0])

lstofcourses = {}

# Going to hardcode these, since its very little of them
lstofcourses['Accountancy'] = {'cost': cost[1]}
lstofcourses['Business'] = {'cost': cost[1]}
lstofcourses['Accountancy and Business'] = {'cost': cost[1]}
lstofcourses['Business and Computing'] = {'cost': cost[1]}
lstofcourses['Business and Computer Engineering'] = {'cost': cost[1]}
lstofcourses['Medicine'] = {'cost': cost[2]}

for course in df:
    for idx, course_category in enumerate(courses):
        if course not in lstofcourses.keys():
            lstofcourses[course] = {}
            lstofcourses[course]['cost'] = cost[idx]

Salary_URL = 'https://www.moe.gov.sg/docs/default-source/document/education/post-secondary/files/ntu.pdf'

convert_into(Salary_URL, 'temp2.csv', pages='all')
df = pd.read_csv("temp2.csv", header=None, names=range(10))

courses = df[0]
courses = [x for x in courses if str(x) != 'nan']
courses = [x for x in courses[1:] if 'College' not in x and 'Sport Science and Management' not in x and 'NIE' not in x]
new_courses = []
double_deg = 0
temp_string = ''
for idx, _ in enumerate(courses):
    if 'Double' in courses[idx]:
        new_courses.append(temp_string)
        temp_string = ''
        double_deg = 2
    if 'Bachelor' in courses[idx]:
        if double_deg <= 0:
            new_courses.append(temp_string)
            temp_string = courses[idx]
        else:
            double_deg -= 1
            temp_string += courses[idx]
    else:
        temp_string += courses[idx]

new_courses = [x for x in new_courses if x != ''] + [temp_string]


median_income = list(df[5])
median_income = [x for x in median_income if str(x) != 'nan']
median_income = [x for x in median_income if '$' in x or 'N.A' in x]

mydict = dict(zip(new_courses, median_income))
keys = list(mydict.keys())

for key in keys:
    mydict[key] = mydict[key].split()[0].replace(',', '').replace('$', '')

# First check for exact match
for key, _ in lstofcourses.items():
    for keyB in mydict.keys():
        if key in keyB and 'Double' not in keyB:
            lstofcourses[key]['median_salary'] = mydict[keyB]

# Second check for no space exact match
for key, _ in lstofcourses.items():
    for keyB in mydict.keys():
        if key.replace(' ', '') in keyB and 'Double' not in keyB and 'median_salary' not in lstofcourses[key].keys():
            lstofcourses[key]['median_salary'] = mydict[keyB]

# Third check for exact match and replace 'and' with &
for key, _ in lstofcourses.items():
    for keyB in mydict.keys():
        if key.replace('and', '&').replace(' ','') in keyB.replace(' ', '') and 'Double' not in keyB and 'median_salary' not in lstofcourses[key].keys():
            lstofcourses[key]['median_salary'] = mydict[keyB]

# Fourth check for exact match and replace 'and' with &
for key, _ in lstofcourses.items():
    for keyB in mydict.keys():
        if key.replace(' ','').lower() in keyB.replace(' ', '').lower() and 'Double' not in keyB and 'median_salary' not in lstofcourses[key].keys():
            lstofcourses[key]['median_salary'] = mydict[keyB]

# Fifth check for double degrees
for key, _ in lstofcourses.items():
    for keyB in mydict.keys():
        if key.lower().split()[0] in keyB.replace(' ', '').lower() and key.lower().split()[-1] in keyB.replace(' ', '').lower() and 'Double' in keyB and 'median_salary' not in lstofcourses[key].keys():
            lstofcourses[key]['median_salary'] = mydict[keyB]

# Sixth check for double degrees
for key, _ in lstofcourses.items():
    for keyB in mydict.keys():
        if key.lower().split()[0] in keyB.replace(' ', '').lower() and key.lower().split()[-1][:4] in keyB.replace(' ', '').lower() and 'Double' in keyB and 'median_salary' not in lstofcourses[key].keys():
            lstofcourses[key]['median_salary'] = mydict[keyB]

# Seventh check for weird wording
for key, _ in lstofcourses.items():
    for keyB in mydict.keys():
        if key.lower().split('and')[0] in keyB.replace(' ', '').lower() and key.lower().split('and')[-1] in keyB.replace(' ', '').lower() and 'Double' in keyB and 'median_salary' not in lstofcourses[key].keys():
            lstofcourses[key]['median_salary'] = mydict[keyB]

# Eighth check for weird wording
for key, _ in lstofcourses.items():
    for keyB in mydict.keys():
        if key.lower().split()[0] in keyB.replace(' ', '').lower() and key.lower().split()[-1] in keyB.replace(' ', '').lower() and 'Double' not in keyB and 'median_salary' not in lstofcourses[key].keys():
            lstofcourses[key]['median_salary'] = mydict[keyB]

# Ninth check for weird wording
for key, _ in lstofcourses.items():
    for keyB in mydict.keys():
        if key.lower().split()[0] in keyB.replace(' ', '').lower() and key.lower().split()[-1] in keyB.replace(' ', '').lower() and 'median_salary' not in lstofcourses[key].keys():
            lstofcourses[key]['median_salary'] = mydict[keyB]

# Tenth check for weird wording
for key, _ in lstofcourses.items():
    for keyB in mydict.keys():
        if key.lower().split('and')[0].split()[0] in keyB.replace(' ', '').lower() and key.lower().split('and')[-1].split()[0] in keyB.replace(' ', '').lower() and 'median_salary' not in lstofcourses[key].keys():
            lstofcourses[key]['median_salary'] = mydict[keyB]

median_mean = round(stats.mean([float(x.replace('$', '').replace(',','').split()[0]) for x in median_income if 'N.A' not in x]),-2)
for key, _ in lstofcourses.items():
    if 'median_salary' not in lstofcourses[key].keys() or lstofcourses[key]['median_salary'] == 'N.A':
        lstofcourses[key]['median_salary'] = median_mean


duration_URL = 'http://www.ntu.edu.sg/Students/Undergraduate/AcademicServices/Pages/AUS-Handbook-AY2017-18.aspx#Period%20of%20Candidature'

df = pd.read_html(duration_URL)

singledeg = df[0]
doubledeg = df[2]

# print(singledeg)
# print(doubledeg)

duration = list(singledeg[2])[2:]
duration = [x.split()[0] for x in duration]
courses = list(singledeg[0])[2:]

for key in lstofcourses.keys():
    for idx, course_cat in enumerate(courses):
        if key.lower().replace(' ','').replace('and', '&') in course_cat.lower().replace(' ','').replace('and', '&'):
            lstofcourses[key]['duration'] = duration[idx]

duration = list(doubledeg[2])[2:]
duration = [x.split()[0] for x in duration]
courses = list(doubledeg[0])[2:]

for key in lstofcourses.keys():
    for idx, course_cat in enumerate(courses):
        if key.lower().replace(' ','').replace('and', '&') in course_cat.lower().replace(' ','').replace('and', '&') and 'duration' not in lstofcourses[key].keys():
            lstofcourses[key]['duration'] = duration[idx]

for key in lstofcourses.keys():
    if 'duration' not in lstofcourses[key].keys():
        lstofcourses[key]['duration'] = '4'  # Cus I got no idea why their years not on the website

json.dump(lstofcourses, codecs.open('NTU_cost_salary.json', 'w', encoding='utf-8'), sort_keys=True, indent=4)

# print(lstofcourses)
# print(new_courses)