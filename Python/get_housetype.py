import requests
import json
import codecs

url = "http://microservice.dev.bambu.life/api/generalCalculator/houseCostCalculatorV2s/getCountryAllData"

querystring = {"countryInput": "Singapore"}

response = requests.request("GET", url, params=querystring)

exec('table = ' + response.text.replace('null', "''"))
table = table['response']

location = []
room_type = []

table = [x for x in table if x['price'] != '' and float(x['price']) != 0]

# for idx, x in enumerate(table):
#     print(x)
#     if (float(x['price'])) == 0:
#         continue

house_locations = {}

for house in table:
    if house['location'] not in location:
        location.append(house['location'])

    if house['roomtype'] not in room_type:
        room_type.append(house['roomtype'])

    if house['location'] not in house_locations.keys():
        house_locations[house['location']] = [house['roomtype'] + ' ' + house['housetype']]
    else:
        house_locations[house['location']].append(house['roomtype'] + ' ' + house['housetype'])


all_house_type = []
for key in house_locations.keys():
    house_locations[key] = sorted(list(set(house_locations[key])))
    all_house_type += house_locations[key]
    all_house_type = list(set(all_house_type))

# print(room_type)
print(table)
# print(len(table))

# Sorting to get a standard sort model for house_types
all_house_type.sort()
HDB_houses = [x for x in all_house_type if 'HDB' in x]
landed_houses = [x for x in all_house_type if 'landed' in x]
condo_houses = [x for x in all_house_type if 'condo' in x]
landed_houses.sort()

order = ['Seven', 'Six', 'Five', 'Four', 'Three', 'Two', 'One']
new_order = []
for num in order:
    for house_type in landed_houses:
        if num in house_type:
            new_order.append(house_type)
landed_houses = new_order

order = [x[1:] for x in order]
new_order = []
for num in order:
    for house_type in condo_houses:
        if num in house_type:
            new_order.append(house_type)
condo_houses = new_order

all_house_type = HDB_houses + condo_houses + landed_houses
# Now finally got the house_type arrangement

# Now rearrange inside in location, put the house_types in order
for key in house_locations.keys():
    new_order = []
    for num in all_house_type:
        for house_type in house_locations[key]:
            if num == house_type:
                new_order.append(house_type)
    house_locations[key] = new_order

house_locations['All'] = all_house_type
# Now capitalise all the first letter of each word to make it nice
for key, value in house_locations.items():
    house_locations[key] = [
        x.split()[0][0].upper() + x.split()[0][1:] + " " + x.split()[1][0].upper() + x.split()[1][1:] for x in value]
    house_locations[key].append('All')
    json.dump(house_locations[key], codecs.open('house_locations/{}.json'.format(key), 'w', encoding='utf-8'),
              sort_keys=False, indent=4)
    house_locations[key].pop()

#  Now finally done with locations to housetypes

all_house_type = [x.split()[0][0].upper() + x.split()[0][1:] + " " + x.split()[1][0].upper() + x.split()[1][1:] for x in all_house_type]
#  Now with housetypes to locations
room_types = {x:[] for x in all_house_type}
for key, value in house_locations.items():
    for keyB in room_types.keys():
        if keyB in value:
            room_types[keyB].append(key)

room_types['All'] = list(house_locations.keys())
for key, value in room_types.items():
    json.dump(value, codecs.open('room_types/{}.json'.format(key), 'w', encoding='utf-8'),
              sort_keys=False, indent=4)

