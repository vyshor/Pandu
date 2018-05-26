import pickle
from xml.etree import ElementTree
import pandas as pd
from fastkml import kml
import json
import codecs

import keytree
from shapely.geometry import Point, shape


with open('places.p', 'rb') as f:
    mydict = pickle.load(f)
kml_file = 'version0.04.kml'


for key in mydict.keys():
    mydict[key] = mydict[key].split(' |')
    newlst = [float(mydict[key][0].split()[-1])]
    newlst.append(float(mydict[key][1][:mydict[key][1].find('<br>')].split()[-1]))
    # print(newlst)
    newlst.reverse()
    newlst.append(0)
    mydict[key] = newlst


print(mydict)

# Parse the KML doc
with open(kml_file, 'rt', encoding="utf-8") as myfile:
    doc=myfile.read().encode('utf-8')
tree = ElementTree.fromstring(doc)
kmlns = tree.tag.split('}')[0][1:]

# Find all Polygon elements anywhere in the doc
elems = tree.findall(".//{%s}Polygon" % kmlns)
elems_master = tree.findall(".//{%s}Placemark" % kmlns)
print(len(elems))
print(len(elems_master))

lst_record = []
for idx, elem in enumerate(elems_master):
    for _, _ in enumerate(elem[3]):
        lst_record.append(idx)

# print(len(lst_record))
# print(elems_master[0][0].text)

# Here's our point of interest
# print(mydict)

# Filter polygon elements using this lambda (anonymous function)
# keytree.geometry() makes a GeoJSON-like geometry object from an
# element and shape() makes a Shapely object of that.
mydict2 = {}
for key, value in mydict.items():
    p = Point(value[0], value[1], value[2])
    for idx, elem in enumerate(elems):
        if shape(keytree.geometry(elem)).contains(p):
            mydict2[key] = elems_master[lst_record[idx]][0].text
            # print(elems_master[lst_record[idx]][0].text)
            break
    # hits = filter(lambda e: shape(keytree.geometry(e)).contains(p),elems )
    # print(map(hits))

print(mydict2)
# key_ins = sorted(set(mydict2.values()))
mydict3 = {}

with open(kml_file, 'rt', encoding="utf-8") as myfile:
    doc=myfile.read().encode('utf-8')
k = kml.KML()
k.from_string(doc)
features = list(k.features())
f2 = list(features[0].features())
f3 = list(f2[0].features())
lst = []
for idx, _ in enumerate(f3):
    # print(f3[idx].name)
    lst.append(f3[idx].name)


for key in lst:
    mydict3[key] = {}
    for keyB, valueB in mydict2.items():
        if key == valueB:
            mydict3[key][keyB] = mydict[keyB]
    if len(list(mydict3[key].keys())) == 0:
        print(key)

print(mydict3)
json.dump(mydict3, codecs.open('kml_to_locations.json', 'w', encoding='utf-8'), sort_keys=True, indent=4)


