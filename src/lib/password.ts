// Password strength validation utilities

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string;
  isValid: boolean;
}

export function checkPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push("رمز عبور باید حداقل 8 کاراکتر باشد");
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push("حداقل یک حرف بزرگ انگلیسی لازم است");
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push("حداقل یک حرف کوچک انگلیسی لازم است");
  }

  // Number check
  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push("حداقل یک عدد لازم است");
  }

  // Special character check (optional but increases score)
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score = Math.min(score + 1, 4);
  }

  // Common password check
  const commonPasswords = [
    "password", "123456", "12345678", "qwerty", "abc123",
    "password123", "admin", "letmein", "welcome", "monkey",
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    score = 0;
    feedback.push("این رمز عبور بسیار رایج است");
  }

  // Calculate validity
  const isValid = score >= 3 && password.length >= 8;

  // Generate feedback message
  let feedbackMessage = "";
  if (score === 0) {
    feedbackMessage = "بسیار ضعیف";
  } else if (score === 1) {
    feedbackMessage = "ضعیف";
  } else if (score === 2) {
    feedbackMessage = "متوسط";
  } else if (score === 3) {
    feedbackMessage = "خوب";
  } else {
    feedbackMessage = "عالی";
  }

  return {
    score,
    feedback: feedbackMessage + (feedback.length > 0 ? " - " + feedback.join(", ") : ""),
    isValid,
  };
}

export function sanitizePassword(password: string): string {
  // Remove any control characters
  return password.replace(/[\x00-\x1F\x7F]/g, "");
}
