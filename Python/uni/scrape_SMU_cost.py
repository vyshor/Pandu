import pandas as pd
from tabula import convert_into, read_pdf
import json
import codecs

URL = 'Tuition Fees SMU.html'
# Note this is the only website that is so strongly secured that I cannot scrape from internet directly

df = pd.read_html(URL)
df = df[0]

bachelor = list(df[0])
bachelor = bachelor[1:3]
cost = list(df[1])
cost = cost[1:3]
cost = [x.replace('$', '').replace(' ','').replace(',','') for x in cost]


courses = list(pd.read_json('SMU_courses.json')[0])

lstofcourses = {}
for _, course in enumerate(courses):
    for idx, course_names in enumerate(bachelor):
        if course in course_names:
            lstofcourses[course] = {}
            lstofcourses[course]['cost'] = cost[idx]


Salary_URL = 'https://www.moe.gov.sg/docs/default-source/document/education/post-secondary/files/smu.pdf'

df = read_pdf(Salary_URL)
df.columns = list(range(6))

courses = list(df[0])[4:]
median_column = list(df[4])[5:]
courses = [x for x in courses if str(x) != 'nan' and '4-years' not in x]
median_column = [x for x in median_column if str(x) != 'nan']
median_column = [x.split()[1].replace('$','').replace(',','') for x in median_column]

for key, _ in lstofcourses.items():
    for idx, course_name in enumerate(courses):
        if key in course_name:
            lstofcourses[key]['median_salary'] = median_column[idx]
            lstofcourses[key]['duration'] = '4'  # All is a four years program

# Then second check for substring using last substring
for key, _ in lstofcourses.items():
    for idx, course_name in enumerate(courses):
        if '(' in key and key.split('(')[1].replace(')','') in course_name and 'median_salary' not in lstofcourses[key].keys():
            lstofcourses[key]['median_salary'] = median_column[idx]
            lstofcourses[key]['duration'] = '4'  # All is a four years program

json.dump(lstofcourses, codecs.open('SMU_cost_salary.json', 'w', encoding='utf-8'), sort_keys=True, indent=4)


# print(lstofcourses)
