#!/usr/bin/env node

const DEFAULT_BASE_URL = "https://project-5v5cr.vercel.app";

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith("--")));
const positionalArgs = args.filter((arg) => !arg.startsWith("--"));
const baseUrl = normalizeBaseUrl(process.env.CONTACT_TEST_BASE_URL || positionalArgs[0] || DEFAULT_BASE_URL);
const runValidSubmission = flags.has("--valid");
const allowRemoteValid = flags.has("--allow-remote-valid");

if (runValidSubmission && !isLocalBaseUrl(baseUrl) && !allowRemoteValid) {
  fail(
    "Refusing to run a valid submission against a non-local URL. Add --allow-remote-valid if you really want to create a live test enquiry.",
  );
}

const tests = [
  {
    name: "wrong captcha is rejected",
    expectedLocationPart: "error=captcha",
    makeFields: ({ answer }) => ({
      captchaAnswer: String(answer + 1),
      website: "",
    }),
  },
  {
    name: "honeypot bot is rejected",
    expectedLocationPart: "error=spam",
    makeFields: ({ answer }) => ({
      captchaAnswer: String(answer),
      website: "https://spam.example",
    }),
  },
];

if (runValidSubmission) {
  tests.push({
    name: "valid human-like submission passes captcha",
    expectedLocationPart: isLocalBaseUrl(baseUrl) ? "sent=1" : "error=storage",
    makeFields: ({ answer }) => ({
      captchaAnswer: String(answer),
      website: "",
    }),
  });
}

console.log(`Testing contact anti-spam at ${baseUrl}`);

for (const test of tests) {
  const form = await loadContactForm();
  const fields = test.makeFields(form);
  const response = await submitContactForm(form, fields);
  const location = response.headers.get("location") || response.url;

  if (!location.includes(test.expectedLocationPart)) {
    fail(`${test.name}: expected redirect containing "${test.expectedLocationPart}", got "${location}"`);
  }

  console.log(`PASS ${test.name} -> ${location}`);
}

console.log("Contact anti-spam tester completed.");

async function loadContactForm() {
  const response = await fetch(`${baseUrl}/contact`);

  if (!response.ok) {
    fail(`Unable to load contact page: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const actionField = matchRequired(html, /name="(\$ACTION_ID_[^"]+)"/, "server action field");
  const token = matchRequired(
    html,
    /<input[^>]*name="captchaToken"[^>]*value="([^"]+)"[^>]*>/,
    "captcha token",
  );
  const [left, right] = matchRequired(html, /What is (\d+) \+ (\d+)\?/, "math challenge").map(Number);

  return {
    actionField,
    answer: left + right,
    token,
  };
}

async function submitContactForm(form, fields) {
  const body = new FormData();

  body.set(form.actionField, "");
  body.set("name", "Anti Spam Test");
  body.set("company", "Eltronic Test");
  body.set("email", "test@example.com");
  body.set("productSlug", "autopi-can-fd-pro");
  body.set("message", "Automated anti-spam test. Please ignore if this valid test was intentionally enabled.");
  body.set("captchaToken", form.token);
  body.set("captchaAnswer", fields.captchaAnswer);
  body.set("website", fields.website);

  return fetch(`${baseUrl}/contact`, {
    body,
    method: "POST",
    redirect: "manual",
  });
}

function matchRequired(text, pattern, label) {
  const match = text.match(pattern);

  if (!match) {
    fail(`Unable to find ${label} in contact page HTML.`);
  }

  return match.length === 2 ? match[1] : match.slice(1);
}

function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, "");
}

function isLocalBaseUrl(url) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url);
}

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exit(1);
}

