/**
 * ============================================================================
 * CONFIG — Central Customization File
 * ============================================================================
 * Edit any text string or audio file path below to personalize the confession
 * experience. Place `nhac1.mp3` and `nhac2.mp3` in the `public/` folder so
 * `./nhac1.mp3` and `./nhac2.mp3` resolve cleanly in both dev and production.
 */
export const CONFIG = {
  /**
   * Background Music Paths
   * - track1: Plays automatically (with smooth fade-in) on the first tap on the flower.
   * - track2: Crossfades in smoothly when the user clicks "Yes ❤️".
   */
  audio: {
    track1: './nhac1.mp3',
    track2: './nhac2.mp3',
    /** Accessibility labels for the floating music toggle button in the top-right corner */
    playLabel: 'Phát nhạc nền',
    pauseLabel: 'Tạm dừng nhạc nền',
    /** Subtle status caption shown only on hover/title or screen readers */
    musicOnText: 'Music On',
    musicOffText: 'Music Paused',
  },

  /**
   * Step 1: The Enchanted Blooming Flower
   */
  flowerStep: {
    /** Prompt displayed below the closed rose before the first tap */
    initialPrompt: 'Cậu thử chạm vào đoá hoa này nhé...✨',
    /** Aria label for the interactive blooming rose button */
    flowerButtonAriaLabel: 'Chạm vào đoá hoa hồng để mở',
    /** Prompt displayed once the rose unfurls and reveals the envelope */
    envelopePrompt: 'Có một bức thư nhỏ tớ muốn gửi cậu từ lâu, cậu mở ra nhé💌',
    /** Aria label for the interactive envelope button */
    envelopeButtonAriaLabel: 'Mở phong thư tình yêu',
  },

  /**
   * Step 2: Unfolding the Love Letter & Playful Buttons
   */
  letterStep: {
    /** Main English confession inside the gold-trimmed love letter */
    confessionText: 'I love u, will u be my girlfriend?',
    /** Primary affirmative button text */
    yesButtonText: 'Yes ❤️',
    /** Playful dodging secondary button text */
    noButtonText: 'No',
    /** Cute teasing tooltips that cycle every time the "No" button dodges */
    noDodgeTooltips: [
      'Đố cậu bắt được tui',
      'Cậu còn sự lựa chọn khác màaaa🥺🥺🥺',
    ],
  },

  /**
   * Step 3: The Final Celebration Keepsake Screen
   */
  celebrationStep: {
    /** Main celebration heading */
    mainHeading: 'Đây là điều tớ đã mong đợi từ lâu, cảm ơn cậu đã đồng ý❤️',
    /** Warm romantic sub-message */
    subMessage:
      'Có thể tớ không biết trước tương lai sẽ thế nào, nhưng tớ biết một điều — tớ muốn có cậu trong những ngày tháng sắp tới. ❤️',
    /** Footer note rendered on two lines */
    footerLine1: "Here's to us! 🥂",
    footerLine2: 'Made with love, just for you.',
  },
} as const;
