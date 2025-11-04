export interface AnimationFrame {
  pet: string;
  duration?: number;
}

export interface Animation {
  frames: AnimationFrame[];
  loop: boolean;
  priority?: number;
}

export const animations: Record<string, Animation> = {
  idle: {
    frames: [
      { pet: '(◕ᴥ◕)' },      // Normal
      { pet: '(◕ᴗ◕)' },      // Slight smile
      { pet: '(◔ᴥ◔)' },      // Eyes shifting left
      { pet: '(◕ᴥ◕)' },      // Back to center
      { pet: '(◑ᴥ◑)' },      // Eyes shifting right
      { pet: '(◕ᴥ◕)' },      // Center
      { pet: '(◕ᴗ◕)' },      // Small smile
      { pet: '(◕ω◕)' },      // Content
      { pet: '(◕ᴥ◕)' },      // Normal
      { pet: '(－ᴥ－)' },     // Blink
      { pet: '(◕ᴥ◕)' },      // Open eyes
      { pet: '(◐ᴥ◐)' },      // Look around
      { pet: '(◕ᴥ◕)' },      // Normal
      { pet: '(◕‿◕)' },      // Happy expression
      { pet: '(◕ᴥ◕)' },      // Back to normal
    ],
    loop: true
  },
  
  blink: {
    frames: [
      { pet: '(◕ᴥ◕)' },      // Normal
      { pet: '(◕_◕)' },      // Squinting
      { pet: '(◕.◕)' },      // Focused dots
      { pet: '(◔_◔)' },      // Looking left confused
      { pet: '(◑_◑)' },      // Looking right confused
      { pet: '(◕_◕)?' },     // Question appears
      { pet: '(¬_¬)' },      // Suspicious
      { pet: '(◕︵◕)' },     // Slight frown
      { pet: '(◕_◕)...' },   // Dots appear
      { pet: '(◕.◕)?' },     // Still confused
      { pet: '(◕ᴥ◕)' },      // Back to normal
    ],
    loop: true
  },
  
  happy: {
    frames: [
      { pet: '(◕ᴥ◕)' },      // Normal
      { pet: '(◕‿◕)' },      // Starting to smile
      { pet: '(◕ᴗ◕)' },      // Bigger smile
      { pet: '(✧ᴥ✧)' },      // Sparkly eyes
      { pet: '(★ᴥ★)' },      // Star eyes
      { pet: '\\(◕ᴗ◕)/' },   // Arms up
      { pet: '\\(✧ᴥ✧)/' },   // Celebrating
      { pet: '(◕ω◕)' },      // Content wiggle
      { pet: '(◕‿◕)✨' },    // Sparkles appear
      { pet: '(★ᴗ★)✨' },    // Maximum happiness
      { pet: '(✧ω✧)' },      // Gleeful
      { pet: '\\(◕ᴥ◕)/' },   // Jumping
      { pet: '(◕ᴗ◕)' },      // Happy face
      { pet: '(✧‿✧)' },      // Sparkling smile
    ],
    loop: true
  },
  
  eating: {
    frames: [
      { pet: '(◕ᴥ◕) 🍪' },    // Looking at food
      { pet: '(◕o◕) 🍪' },    // Eyes wide, excited
      { pet: '(✧ᴥ✧) 🍪' },    // Sparkly eyes at food
      { pet: '(◕◡◕)' },       // Mouth opening
      { pet: '(◕~◕)' },       // Chewing 1
      { pet: '(◕˜◕)' },       // Chewing 2
      { pet: '(◕~◕)' },       // Chewing 3
      { pet: '(◕ᴗ◕)' },       // Swallowing
      { pet: '(◕‿◕)' },       // Satisfied
      { pet: '(✧ᴥ✧)' },       // Happy about food
      { pet: '(◕ω◕)' },       // Content
      { pet: '(◕ᴥ◕)' },       // Back to normal
    ],
    loop: false
  },
  
  sleeping: {
    frames: [
      { pet: '(◕ᴥ◕)' },       // Awake
      { pet: '(◔ᴥ◔)' },       // Getting sleepy
      { pet: '(￣ᴥ￣)' },     // Eyes heavy
      { pet: '(－ᴥ－)' },     // Eyes closed
      { pet: '(˘ᴥ˘)' },       // Peaceful 1
      { pet: '(－ᴥ－)z' },    // First z
      { pet: '(˘ᴥ˘)z' },      // Breathing
      { pet: '(－ᴥ－)zz' },   // More z's
      { pet: '(˘ᴥ˘)zz' },     // Deep sleep
      { pet: '(－ᴥ－)zzZ' },  // Big Z
      { pet: '(˘ᴥ˘)zzZ' },    // Dreaming
      { pet: '(－ᴥ－)zz' },   // Breathing out
      { pet: '(˘ᴥ˘)z' },      // Light sleep
      { pet: '(－ᴥ－)' },     // Quiet sleep
    ],
    loop: true
  },
  
  walking: {
    frames: [
      { pet: ' (◕ᴥ◕) ' },
      { pet: 'ƪ(◕ᴥ◕) ' },
      { pet: 'ƪ(◑ᴥ◑)ʃ' },
      { pet: ' (◕ᴥ◕)ʃ' },
      { pet: ' (◐ᴥ◐) ' },
      { pet: 'ƪ(◕ᴥ◕) ' },
    ],
    loop: true
  },
  
  playing: {
    frames: [
      { pet: '(◕ᴥ◕) ⚾' },     // See ball
      { pet: '(◕o◕) ⚾' },     // Excited
      { pet: '\\(◕ᴥ◕) ⚾' },   // Reach for ball
      { pet: '\\(◕ᴥ◕)/ ⚾' },  // Jump
      { pet: '\\(✧ᴥ✧)/⚾' },   // Catch!
      { pet: '(◕ᴥ◕)ﾉ⚾' },     // Throw 1
      { pet: '(◕ᴥ◕)/⚾' },     // Throw 2
      { pet: '\\(◕ᴥ◕)/' },    // Celebrate
      { pet: '(◕ᴥ◕)\\' },      // Dance 1
      { pet: '/(◕ᴥ◕)' },       // Dance 2
      { pet: '(✧ᴥ✧)' },        // Happy
      { pet: '(◕ω◕)' },        // Satisfied
    ],
    loop: false
  },
  
  sad: {
    frames: [
      { pet: '(◕ᴥ◕)' },       // Normal
      { pet: '(◔ᴥ◔)' },       // Getting sad
      { pet: '(◕︵◕)' },      // Frowning
      { pet: '(◕╭╮◕)' },      // More sad
      { pet: '(╥ᴥ╥)' },       // Tears forming
      { pet: '(╥﹏╥)' },       // Crying
      { pet: '(◕︵◕)💧' },    // Tear drop
      { pet: '(╥_╥)' },       // Sobbing
      { pet: '(◕╭╮◕)' },      // Still sad
      { pet: '(◔︵◔)' },      // Looking down
      { pet: '(◕_◕)' },       // Dejected
    ],
    loop: true
  },
  
  love: {
    frames: [
      { pet: '(◕ᴥ◕)' },
      { pet: '(◕ᴥ◕) ♡' },
      { pet: '(✧ᴥ✧) ♡' },
      { pet: '(♡ᴥ♡)' },
      { pet: '(✧ᴗ✧) ♡' },
    ],
    loop: false
  },
  
  tired: {
    frames: [
      { pet: '(◕ᴥ◕)' },
      { pet: '(◔ᴥ◔)' },
      { pet: '(￣ᴥ￣)' },
      { pet: '(－ᴥ－)' },
      { pet: '(￣ᴥ￣)' },
    ],
    loop: true
  },
  
  sick: {
    frames: [
      { pet: '(×ᴥ×)' },
      { pet: '(×﹏×)' },
      { pet: '(@ᴥ@)' },
      { pet: '(×ᴥ×)' },
    ],
    loop: true
  },
  
  bathing: {
    frames: [
      { pet: '(◕ᴥ◕) 🚿' },     // See shower
      { pet: '(◕o◕) 🚿' },     // Surprised by water
      { pet: '(>ᴥ<) 🚿' },     // Water in face
      { pet: '(~ᴥ~) 💦' },     // Splashing
      { pet: '(◕△◕) 🧼' },     // Soap!
      { pet: '(◕▽◕) 🧼' },     // Scrubbing
      { pet: '(>ᴥ<) 💦' },     // More water
      { pet: '(~ᴥ~) 💦' },     // Rinsing
      { pet: '(◕ᴥ◕) 💧' },     // Dripping
      { pet: '(◕ᴗ◕) ✨' },     // Clean!
      { pet: '(✧ᴥ✧) ✨' },     // Sparkly clean
      { pet: '(◕ᴥ◕) ✨' },     // Fresh
    ],
    loop: false
  },
  
  celebrating: {
    frames: [
      { pet: '(◕ᴥ◕)' },         // Start
      { pet: '(◕ᴗ◕)' },         // Smile growing
      { pet: '\\(◕ᴥ◕)/' },      // Arms up
      { pet: '\\(✧ᴥ✧)/' },      // Sparkly eyes
      { pet: '\\(★ᴥ★)/' },      // Star eyes
      { pet: '🎉(◕ᴥ◕)🎉' },    // Confetti!
      { pet: '🎊(✧ᴥ✧)🎊' },    // More party
      { pet: '\\(◕ᴗ◕)/' },      // Jump 1
      { pet: '/(◕ᴥ◕)\\' },      // Dance
      { pet: '\\(◕ᴥ◕)/' },      // Jump 2
      { pet: '✨(✧ᴥ✧)✨' },    // Sparkles
      { pet: '🌟(★ᴗ★)🌟' },    // Stars
      { pet: '\\(◕ω◕)/' },      // Victory!
      { pet: '(✧ᴗ✧)' },        // Glowing
    ],
    loop: false
  }
};

// Get weather overlay
export function getWeatherOverlay(weather: string): string {
  const overlays: Record<string, string> = {
    sunny: '☀️',
    rainy: '🌧️',
    snowy: '❄️',
    cloudy: '☁️'
  };
  return overlays[weather] || '';
}

// Accessories feature removed for simplicity