from garminconnect import Garmin
from math import floor
from datetime import datetime

# Initializing Garmdown and Garmin Connect Database
username = 'erinkeenan6@yahoo.com'
password = 'Elephant8910!?'
garmin = Garmin(username, password)
garmin.login()

#Todays Date as String
Date = datetime.today().strftime('%Y-%m-%d') # %Y = 2025   %y = 25


garminData = garmin.get_sleep_data(Date)
sleepDataVar = ['sleepTimeSeconds', 'deepSleepSeconds', 'lightSleepSeconds', 'remSleepSeconds', 'awakeSleepSeconds', 'awakeCount', 'avgSleepStress']
SleepData = { name : garminData['dailySleepDTO'][name] for name in sleepDataVar}
SleepData['sleepScore'] = garminData['dailySleepDTO']['sleepScores']['overall']['value']

garminData = garmin.get_heart_rates(Date)
bpmDataVar = ['maxHeartRate', 'restingHeartRate', 'lastSevenDaysAvgRestingHeartRate']
bpmData = {name : garminData[name] for name in bpmDataVar}
bpmData['variation'] = bpmData['restingHeartRate'] - bpmData['lastSevenDaysAvgRestingHeartRate']

garminData = garmin.get_activities_by_date(Date)
activityDuration = floor(sum([activity['duration'] for activity in garminData]))
activityCal = sum([activity['calories'] for activity in garminData])

avgstressLevel = garmin.get_stress_data(Date)['avgStressLevel']


# Garmin Connect Logout to Protect Privacy
garmin.logout()