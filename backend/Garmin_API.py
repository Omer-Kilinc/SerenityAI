from garminconnect import Garmin
from google import genai
from datetime import datetime
from math import floor


# Logs Into and Initializes Googles Gemini AI
client = genai.Client(api_key="AIzaSyBx2IdiP98pan1fst28dtqlVeranfNYWU0")

# Initializing Garmdown and Garmin Connect Database
username = 'erinkeenan6@yahoo.com'
password = 'Elephant8910!?'
garmin = Garmin(username, password)
garmin.login()

#Todays Date as String
#Date = datetime.today().strftime('%Y-%m-%d') # %Y = 2025   %y = 25
Date = '2025-03-15'

def GetSleepReply() :
    # Gathers and Filters Useful Garmin Watch Data For A Certain Date (Present Day)
    garminData = garmin.get_sleep_data(Date)
    sleepDataVar = ['sleepTimeSeconds', 'sleepStartTimestampLocal', 'sleepEndTimestampLocal', 'deepSleepSeconds', 'lightSleepSeconds', 'remSleepSeconds', 'awakeSleepSeconds', 'awakeCount', 'avgSleepStress']
    SleepData = { name : garminData['dailySleepDTO'][name] for name in sleepDataVar}
    SleepData['sleepScore'] = garminData['dailySleepDTO']['sleepScores']['overall']['value']

    #Generates Responses and Help From Gemini Using Garmin Data
    #responseSleep = client.models.generate_content(
    #    model = 'gemini-2.0-pro-exp-02-05', 
    #    contents = f"The Garmin Watch user {username} recorded sleeping data for their last sleep session. The user's sleep data is the following : {SleepData}. Provide feedback on the quality of sleep of the user, as well as how beneficial it may be to go to sleep and wake up at consistent times and how to achieve this. Also comment on the sleep data and use said data in your response to provide further analysis and understanding. Finally, reccomend ideas and techniques to improve quality of sleep the next time around. Make sure that the data taken straight from the variable provided is formatted to be easily readable and understandable (instead of 3600 seconds for example write 60 hours). Make sure that the response is no longer than 350 words in total. Use emojis and kaomoji to improve mood and emotiveness of the response. Additionally use this data to comment briefly on any notable levels of stress you can infer.")

    # Presents The Gathered Data and Google Gemini Responses
    return (SleepData)

def GetBPMReply() :
    # Gathers and Filters Useful Garmin Watch Data For A Certain Date (Present Day)
    garminData = garmin.get_heart_rates(Date)
    bpmDataVar = ['maxHeartRate', 'restingHeartRate', 'lastSevenDaysAvgRestingHeartRate']
    bpmData = {name : garminData[name] for name in bpmDataVar}
    bpmData['variation'] = bpmData['restingHeartRate'] - bpmData['lastSevenDaysAvgRestingHeartRate']

    #Generates Responses and Help From Gemini Using Garmin Data
    responseBPM = client.models.generate_content(
        model = 'gemini-2.0-pro-exp-02-05', 
        contents = f"The Garmin Watch user recorded their Heart rate data throughout the day. The user's BPM data is the following : {bpmData}. Provide feedback on the health of their heart rate. Also comment on the heart rate data and use said data in your response to provide further analysis and understanding. Finally, reccomend ideas and techniques to improve heart rate the next time around. Make sure that the data taken straight from the variable provided is formatted to be easily readable and understandable (instead of 3600 seconds for example write 60 hours). Make sure that the response is no longer than 350 words in total. Use emojis and kaomoji to improve mood and emotiveness of the response. Additionally use this data to comment briefly on any notable levels of stress you can infer.")
    
    # Presents The Gathered Data and Google Gemini Responses
    return (bpmData, responseBPM.text)

def GetActivityReply() : 
    # Gathers and Filters Useful Garmin Watch Data For A Certain Date (Present Day)
    garminData = garmin.get_activities_by_date(Date)
    activityDurations = {(activity['activityName'], activity['activityType']['typeKey']) : activity['duration'] for activity in garminData}
    activityDurations['total'] = floor(sum([activity['duration'] for activity in garminData]))
    activityCal = sum([activity['calories'] for activity in garminData])

    #Generates Responses and Help From Gemini Using Garmin Data
    responseActivity = client.models.generate_content(
        model = 'gemini-2.0-pro-exp-02-05', 
        contents = f"The Garmin Watch user {username} recorded their physical activity data throughout the day. The gathered data is the following : {activityDurations} and {activityCal}. Provide feedback on the health of their day. Also comment on the how long they partook in the activity for (preferable > 20min but criticise overworking) and use given data in your response to provide further analysis and understanding. Finally, reccomend ideas and techniques to improve enjoyment of and calibrate frequency and longevity of the activities partaken in. Make sure that the data taken straight from the variable provided is formatted to be easily readable and understandable (instead of 3600 seconds for example write 60 hours). Make sure that the response is no longer than 350 words in total. Use emojis and kaomoji to improve mood and emotiveness of the response. Additionally use this data to comment briefly on any notable levels of stress you can infer.")
    
    # Presents The Gathered Data and Google Gemini Responses
    return (activityDurations, activityCal, responseActivity.text)

def GetStressReply() :
    # Gathers and Filters Useful Garmin Watch Data For A Certain Date (Present Day)
    avgstressLevel = garmin.get_stress_data(Date)['avgStressLevel']

    #Generates Responses and Help From Gemini Using Garmin Data
    responseStress = client.models.generate_content(
        model = 'gemini-2.0-pro-exp-02-05', 
        contents = f"The users Garmin Watch recorded their stress level data throughout the day. The recorded level is the following : {avgstressLevel}. Provide feedback on the health of the user using specified data in your response. Finally, reccomend ideas and techniques to improve the users parameters the next time around. Make sure that the response is no longer than 350 words in total. Use emojis and kaomoji to improve mood and emotiveness of the response")
    
    # Presents The Gathered Data and Google Gemini Responses
    return (avgstressLevel, responseStress.text)

def CustomReply(custom) :
    #Generates Responses and Help From Gemini Using Garmin Data
    responseCustom = client.models.generate_content(
        model = 'gemini-2.0-pro-exp-02-05', 
        contents = custom + 'Make sure that the response is no longer than 350 words in total. Use emojis and kaomoji to improve mood and emotiveness of the response')
    
    # Presents The Gathered Data and Google Gemini Responses
    return (responseCustom.text)


# Garmin Connect Logout to Protect Privacy
garmin.logout()