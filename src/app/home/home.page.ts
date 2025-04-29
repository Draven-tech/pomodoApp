import { Component, OnInit, OnDestroy } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

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
  remainingSeconds: number = 25 * 60;
  currentTime: Date = new Date();
  private timeInterval: any;
  private timerInterval: any;

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

  // Timer logic
  startPomodoro() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isWorkTime = true;
    this.remainingSeconds = 25 * 60;

    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      
      // Force UI update
      this.currentTime = new Date();

      if (this.remainingSeconds <= 0) {
        this.handleTimerCompletion();
      }
    }, 1000);
  }

  handleTimerCompletion() {
    clearInterval(this.timerInterval);
    
    if (this.isWorkTime) {
      // Work session ended
      this.notify('Work Session Over!', 'Time for a 5-minute break');
      this.isWorkTime = false;
      this.remainingSeconds = 5 * 60;
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
        id: 1
      }]
    });
    await Haptics.vibrate({ duration: 500 });
  }

  resetTimer() {
    this.stopTimerInterval();
    this.isRunning = false;
    this.isWorkTime = true;
    this.remainingSeconds = 25 * 60;
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

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  formatCurrentTime(): string {
    return this.currentTime.toLocaleTimeString();
  }
}