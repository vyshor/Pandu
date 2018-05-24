import pandas as pd
import json
import codecs

URL = 'https://admissions.smu.edu.sg/admissions/indicative-grade-profiles-igp'

df = pd.read_html(URL)
courses = df[0][0][2:]
courses = [x.replace('Bachelor of ', '').strip() for x in courses]
courses = [x.replace('Laws', 'Law') for x in courses]  # Weird outliner

json.dump(courses, codecs.open('SMU_courses.json', 'w', encoding='utf-8'), sort_keys=True, indent=4)
