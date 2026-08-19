export function normalizeUsername(value: string) {
  return value.trim();
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validateSignup(input: {
  username?: string;
  email?: string;
  password?: string;
}) {
  const username = normalizeUsername(input.username || "");
  const email = normalizeEmail(input.email || "");
  const password = input.password || "";

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return {
      error:
        "Username must be 3–20 characters and only letters, numbers, or underscore.",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  return { username, email, password };
}
