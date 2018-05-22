import pandas as pd
import json
import codecs

URL = 'http://www.ntu.edu.sg/Students/Undergraduate/AcademicServices/AcademicProgrammes/Pages/Degree-Programmes.aspx'

df = pd.read_html(URL)
programs = df[0][0]
programs = [x.replace('*', '').replace('\u200b', '').replace('\xa0', ' ') for x in programs if "Bachelor" not in x]
programs = programs[1:]

doubledegree = df[2][0]
doubledegree = [x.replace('*', '').replace('\u200b', '').replace('\xa0', ' ') for x in doubledegree]
doubledegree = doubledegree[1:]

programs += doubledegree
json.dump(programs, codecs.open('NTU_courses.json', 'w', encoding='utf-8'), sort_keys=True, indent=4)

