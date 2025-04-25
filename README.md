Pomodoro Timer Mobile App Activity

You are going to build a mobile application that will make use of the Pomodoro Technique and In-app 
notifications.

The Pomodoro Technique is a popular productivity method where users work in focused intervals 
(typically 25 minutes) followed by a short break (5 minutes).

Project Name: 
pomodoroApp

Application ID (for the applicationId section in your android/app/build.gradle file)
com.<your lastname>.pomodoro-app


The app will:
1. Start a 25-minute work session. (a Pomodoro)
2. Notify the user when the work session ends.
3. Start a 5-minute break.
4. Notify the user when the break ends.


Actual application behavior:
1. The app will have a real time clock display in order to have a visual guide to the user of the 
current time. 
2. Then your app will have a start Pomodoro cycle button which will take the current time then 
display a 25 minute countdown timer. 
3. When the timer reaches zero your app will fire a notification (include an audio cue or let your 
phone vibrate). 
4. Another countdown time will appear to signify the 5 minute break interval.
5. When the timer reaches zero you app will fire a notification that the break has also ended. 
6. Your app will then revert back to its initial state waiting for another Pomodoro session cycle.
7. By pressing the hard back button of you phone the app will exit
