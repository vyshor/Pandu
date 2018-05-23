import pandas as pd
import json
import codecs
import re

URL = 'http://www.nus.edu.sg/oam/apply-to-nus/A-levels-subject-prerequisites.html'

df = pd.read_html(URL)
df = df[0]
df.columns = list(range(len(df.columns)))
courses = df[0]
courses = [re.sub("[\(\[].*?[\)\]]", "", x).replace('*', '').strip().replace('%', '').replace('#','').replace("@", '').replace("^", '').strip() for x in courses]

json.dump(courses, codecs.open('NUS_courses.json', 'w', encoding='utf-8'), sort_keys=True, indent=4)
