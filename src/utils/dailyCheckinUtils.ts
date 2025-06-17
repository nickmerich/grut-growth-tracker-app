
export const getPersonalizedAffirmation = () => {
  const affirmations = [
    "Every step forward is progress, no matter how small.",
    "You are capable of amazing things when you stay consistent.",
    "Today's effort is tomorrow's strength.",
    "Your commitment to growth is inspiring.",
    "Small daily improvements lead to stunning results."
  ];
  return affirmations[Math.floor(Math.random() * affirmations.length)];
};

export const getTomorrowActionStep = (completed: boolean) => {
  if (completed) {
    return "Build on today's success by maintaining the same energy and focus.";
  } else {
    return "Tomorrow is a fresh start. Focus on one small action that moves you closer to your goal.";
  }
};

export const moodEmojis = ["😢", "😕", "😐", "🙂", "😊", "😄", "🤩", "🎉", "🔥", "⭐"];
