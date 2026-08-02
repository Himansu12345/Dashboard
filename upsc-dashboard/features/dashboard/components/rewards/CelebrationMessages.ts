export const celebrationMessages = [
  "Another promise kept.",
  "Consistency beats intensity.",
  "Today's discipline builds tomorrow's success.",
  "You showed up. That's what matters.",
  "One mission closer to your goal.",
  "Small wins create great achievements.",
  "Stay consistent. Stay unstoppable.",
  "Progress is earned, one mission at a time.",
  "Discipline compounds every single day.",
  "Success follows consistency.",
  "Execution creates confidence.",
  "Keep moving forward.",
  "Today's effort will thank you tomorrow.",
  "Momentum is building.",
  "Strong habits create strong results.",
  "You honored your commitment.",
  "Every completed mission strengthens your future.",
  "You didn't just study—you executed.",
  "Keep your streak alive.",
  "Well done. Now prepare for the next mission.",
];

export function getRandomCelebrationMessage() {
  return celebrationMessages[
    Math.floor(Math.random() * celebrationMessages.length)
  ];
}