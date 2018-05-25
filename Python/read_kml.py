from fastkml import kml
import pandas as pd


kml_file = '../version0.04.kml'
with open(kml_file, 'rt', encoding="utf-8") as myfile:
    doc=myfile.read().encode('utf-8')

# doc = doc.split('\n')

k = kml.KML()
k.from_string(doc)

features = list(k.features())
print(len(features))

f2 = list(features[0].features())
print(len(f2))
print(f2[0].name)

f3 = list(f2[0].features())
print(len(f3))
lst = []
for idx, _ in enumerate(f3):
    # print(f3[idx].name)
    lst.append(f3[idx].name)


PATH_FILE = 'room_types/All.json'
df = pd.read_json(PATH_FILE)
df = list(df[0])[:-1]
print(len(df))

no_location = []
for location in df:
    if location.upper() not in lst:
        print(location)
        no_location.append(location)

print(len(no_location))