import { Component, OnInit, OnDestroy } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  // Timer states
  isRunning: boolean = false;
  isWorkTime: boolean = true;
  remainingSeconds: number = 25 * 60;
  currentTime: Date = new Date();
  private timeInterval: any;
  private timerInterval: any;

  // Adjustable times
  workTimeMinutes: number = 25;
  workTimeSeconds: number = 0;
  breakTimeMinutes: number = 5;
  breakTimeSeconds: number = 0;

  async ngOnInit() {
    await this.setupNotifications();
    this.startTimeUpdates();
  }

  ngOnDestroy() {
    this.stopAllIntervals();
  }

  private async setupNotifications() {
    // Request permissions
    const { display } = await LocalNotifications.requestPermissions();
    if (display === 'granted') {
      await LocalNotifications.createChannel({
        id: 'pomodoro_channel',
        name: 'Pomodoro Timer',
        importance: 5, // HIGH importance (shows as banner)
        visibility: 1, // Public (shows on lock screen)
        sound: 'default', // Use default system sound
      });
    }
  }

  startTimeUpdates() {
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  startPomodoro() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isWorkTime = true;
    this.remainingSeconds = this.workTimeMinutes * 60 + this.workTimeSeconds;

    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      this.currentTime = new Date();

      if (this.remainingSeconds <= 0) {
        this.handleTimerCompletion();
      }
    }, 1000);
  }

  async handleTimerCompletion() {
    clearInterval(this.timerInterval);

    if (this.isWorkTime) {
      await this.notify(
        'Work Session Over!', 
        `Time for a ${this.breakTimeMinutes} minute break`
      );
      this.isWorkTime = false;
      this.remainingSeconds = this.breakTimeMinutes * 60 + this.breakTimeSeconds;
    } else {
      await this.notify(
        'Break Over!', 
        'Ready for another work session?'
      );
      this.isRunning = false;
      return;
    }

    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      this.currentTime = new Date();

      if (this.remainingSeconds <= 0) {
        this.handleTimerCompletion();
      }
    }, 1000);
  }

  async notify(title: string, body: string) {
    try {
      // First ensure we have permission
      const { display } = await LocalNotifications.checkPermissions();
      if (display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }
  
      // Schedule the notification
      await LocalNotifications.schedule({
        notifications: [{
          title: title,
          body: body,
          id: Math.floor(Math.random() * 10000),
          channelId: 'pomodoro_channel',
          sound: 'default',
          extra: { type: 'pomodoro' },
          // Platform-specific options (type-safe approach)
          ...(this.getPlatformNotificationOptions())
        }]
      });
  
      await Haptics.vibrate({ duration: 500 });
    } catch (error) {
      console.error('Notification error:', error);
    }
  }

  private getPlatformNotificationOptions(): any {
    if (Capacitor.getPlatform() === 'android') {
      return {
        smallIcon: 'ic_stat_icon', // Make sure this exists in your Android resources
        priority: 'high',
        visibility: 'public'
      };
    } else if (Capacitor.getPlatform() === 'ios') {
      return {
        sound: 'default',
        attachments: null
      };
    }
    return {};
  }

  resetTimer() {
    this.stopTimerInterval();
    this.isRunning = false;
    this.isWorkTime = true;
    this.remainingSeconds = this.workTimeMinutes * 60 + this.workTimeSeconds;
  }

  startBreak() {
    if (this.isRunning || this.isWorkTime) return;

    this.isRunning = true;
    this.isWorkTime = false;
    this.remainingSeconds = this.breakTimeMinutes * 60 + this.breakTimeSeconds;

    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      this.currentTime = new Date();

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

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  formatCurrentTime(): string {
    return this.currentTime.toLocaleTimeString();
  }
}