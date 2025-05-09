import { Component, OnInit, OnDestroy } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics } from '@capacitor/haptics';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  // Timer states
  isRunning: boolean = false;
  isWorkTime: boolean = true;
  remainingSeconds: number = 25 * 60; // Default to 25 minutes (in seconds)
  currentTime: Date = new Date();
  private timeInterval: any;
  private timerInterval: any;

  // Adjustable work and break times (default: 25 minutes, 5 minutes)
  workTimeMinutes: number = 25;
  workTimeSeconds: number = 0;
  breakTimeMinutes: number = 5;
  breakTimeSeconds: number = 0;

  async ngOnInit() {
    await LocalNotifications.requestPermissions();
    this.startTimeUpdates();
  }

  ngOnDestroy() {
    this.stopAllIntervals();
  }

  // Current time updates
  startTimeUpdates() {
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  // Timer logic for work session
  startPomodoro() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isWorkTime = true;

    // Calculate remaining seconds from minutes and seconds
    this.remainingSeconds = this.workTimeMinutes * 60 + this.workTimeSeconds;

    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      this.currentTime = new Date();

      if (this.remainingSeconds <= 0) {
        this.handleTimerCompletion();
      }
    }, 1000);
  }

  // Handle timer completion (Work or Break session)
  handleTimerCompletion() {
    clearInterval(this.timerInterval);

    if (this.isWorkTime) {
      // Work session ended
      this.notify('Work Session Over!', `Time for a ${this.breakTimeMinutes} minute break`);
      this.isWorkTime = false;
      this.remainingSeconds = this.breakTimeMinutes * 60 + this.breakTimeSeconds; // Set break time from user input
    } else {
      // Break ended
      this.notify('Break Over!', 'Ready for another work session?');
      this.isRunning = false;
      return;
    }

    // Start next interval
    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      this.currentTime = new Date(); // Keep updating current time

      if (this.remainingSeconds <= 0) {
        this.handleTimerCompletion();
      }
    }, 1000);
  }

  async notify(title: string, body: string) {
    await LocalNotifications.schedule({
      notifications: [{
        title: title,
        body: body,
        id: 1,
        badge: 1, // Optional: show a badge on the app icon
        foreground: true, // Ensures notification appears while app is in the foreground
        extra: { foo: 'bar' }, // Optional data you can use later if needed
      }]
    });

    // Trigger haptic feedback (vibration)
    await Haptics.vibrate({ duration: 500 });
  }

  // Reset Timer
  resetTimer() {
    this.stopTimerInterval();
    this.isRunning = false;
    this.isWorkTime = true;
    this.remainingSeconds = this.workTimeMinutes * 60 + this.workTimeSeconds; // Reset to user-defined work time
  }

  // Start Break manually
  startBreak() {
    if (this.isRunning || this.isWorkTime) return;

    this.isRunning = true;
    this.isWorkTime = false;
    this.remainingSeconds = this.breakTimeMinutes * 60 + this.breakTimeSeconds; // Set break time from user input

    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      this.currentTime = new Date(); // Keep updating current time

      if (this.remainingSeconds <= 0) {
        this.handleTimerCompletion();
      }
    }, 1000);
  }

  private stopTimerInterval() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private stopAllIntervals() {
    clearInterval(this.timeInterval);
    this.stopTimerInterval();
  }

  // Format time to MM:SS
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Format current time as HH:MM:SS
  formatCurrentTime(): string {
    return this.currentTime.toLocaleTimeString();
  }
}
