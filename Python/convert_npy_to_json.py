import numpy as np
import json
import codecs

NTU = np.load('NTU_hostel_fees.npy').tolist()
SMU = np.load('SMU_hostel_fees.npy').tolist()
NUS = np.load('NUS_hostel_fees.npy').tolist()

json.dump(NTU, codecs.open('NTU_hostel.json', 'w', encoding='utf-8'), sort_keys=True, indent=4)
json.dump(SMU, codecs.open('SMU_hostel.json', 'w', encoding='utf-8'), sort_keys=True, indent=4)
json.dump(NUS, codecs.open('NUS_hostel.json', 'w', encoding='utf-8'), sort_keys=True, indent=4)
