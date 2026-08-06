import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const authContext = readFileSync("src/context/AuthContext.jsx", "utf8");
const planContext = readFileSync("src/context/PlanContext.jsx", "utf8");
const customerImportContext = readFileSync("src/context/CustomerImportContext.jsx", "utf8");
const customerRhythm = readFileSync("src/pages/CustomerRhythm.jsx", "utf8");
const app = readFileSync("src/App.jsx", "utf8");
const notification = readFileSync("src/notification.js", "utf8");
const notificationsPage = readFileSync("src/pages/Notification.jsx", "utf8");
const dialogueFlow = readFileSync("src/pages/DialogueFlow.jsx", "utf8");
const forgotPassword = readFileSync("src/pages/ForgotPassword.jsx", "utf8");
const rolesAndPermissions = readFileSync("src/components/settings/RolesAndPermissions.jsx", "utf8");
const layout = readFileSync("src/components/common/Layout.jsx", "utf8");
const myProfile = readFileSync("src/components/settings/MyProfile.jsx", "utf8");
const indexCss = readFileSync("src/index.css", "utf8");
const indexHtml = readFileSync("index.html", "utf8");
const razorpayLoader = readFileSync("src/utils/razorpayCheckout.js", "utf8");
const subscriptionPopup = readFileSync("src/components/settings/subscription/SubscriptionPopup.jsx", "utf8");
const subscriptionPage = readFileSync("src/components/settings/subscription/SubscriptionPage.jsx", "utf8");
const whatsappCredits = readFileSync("src/components/settings/subscription/components/WhatsAppCredits.jsx", "utf8");

test("Auth validation is skipped when no token exists", () => {
  assert.match(authContext, /const token = localStorage\.getItem\("token"\)/);
  assert.match(authContext, /if \(!token\) \{\s*setAuth\(null\);\s*setLoading\(false\);\s*return null;\s*\}/s);
  assert.match(authContext, /api\.get\(`\/api\/auth\/validate-token`\)/);
  assert.match(authContext, /error\.response\?\.status === 401/);
});

test("Plan usage fetch waits for authenticated state", () => {
  assert.match(planContext, /import \{ useAuth \} from "\.\/AuthContext"/);
  assert.match(planContext, /if \(authLoading \|\| !isAuthenticated \|\| !token\) \{\s*resetPlans\(\);\s*return null;\s*\}/s);
  assert.match(planContext, /api\.get\("\/api\/subscriptions\/credit\/usage"\)/);
  assert.match(planContext, /error\.response\?\.status === 401/);
});

test("Customer active-import fetch waits for auth, token, and retailer id", () => {
  assert.match(customerImportContext, /import \{ useAuth \} from '\.\/AuthContext';/);
  assert.match(customerImportContext, /const canFetchActiveJobs = !authLoading && Boolean\(auth\) && Boolean\(retailerId\) && Boolean\(token\);/);
  assert.match(customerImportContext, /if \(!canFetchActiveJobs \|\| inFlightRef\.current\) return;/);
  assert.match(customerImportContext, /api\.get\(`\/api\/customers\/active-imports\/\$\{retailerId\}`\)/);
  assert.match(customerImportContext, /err\.response\?\.status === 401/);
});

test("CustomerRhythm validates JSON responses before parsing", () => {
  assert.match(customerRhythm, /fetch\("\/assets\/Comingsoon\.json"\)/);
  assert.match(customerRhythm, /contentType\.includes\("application\/json"\)/);
  assert.match(customerRhythm, /if \(!response\.ok\)/);
  assert.match(customerRhythm, /setSoon\(await response\.json\(\)\)/);
  assert.doesNotMatch(customerRhythm, /\.then\(\(res\) => res\.json\(\)\)/);
  assert.equal(existsSync("public/assets/Comingsoon.json"), true);
  assert.doesNotMatch(customerRhythm, /fetch\("\/assets\/comingSoon\.json"\)/);
});

test("Normal null subscription plan state is handled safely", () => {
  assert.match(rolesAndPermissions, /res\.data\?\.subscription\?\.plan/);
  assert.match(rolesAndPermissions, /typeof plan === "string" \? plan\.toLowerCase\(\) : null/);
  assert.doesNotMatch(rolesAndPermissions, /subscription data plan:/);
});

test("Confirmed profile debug logs do not expose full customer objects", () => {
  assert.doesNotMatch(layout, /PROFILE COMPLETION/);
  assert.doesNotMatch(myProfile, /console\.log\(retailerData\)/);
});

test("Forgot Password uses the established notification helper only", () => {
  assert.match(forgotPassword, /import showToasts from ['"]\.\.\/utils\/ToastNotification['"]/);
  assert.doesNotMatch(forgotPassword, /\bshowToast\(/);
  assert.match(forgotPassword, /showToasts\("Email not found\. Please try the password reset process again\.", "error"\)/);
});

test("Dialogue Flow auth branches occur after hooks are declared", () => {
  const firstHook = dialogueFlow.indexOf("const reactFlowWrapper = useRef(null)");
  const loadingReturn = dialogueFlow.indexOf("if (authLoading)");
  const disconnectedReturn = dialogueFlow.indexOf("if (!isWhatsAppConnected)");

  assert.ok(firstHook > -1, "expected hook declarations");
  assert.ok(loadingReturn > firstHook, "loading return must be after hooks");
  assert.ok(disconnectedReturn > firstHook, "disconnected return must be after hooks");
});

test("Dialogue Flow skips API fetches only while auth is unresolved or WhatsApp is disconnected", () => {
  assert.match(dialogueFlow, /if \(authLoading \|\| !isWhatsAppConnected\) \{\s*setFlowsLoading\(false\);\s*return;\s*\}/s);
  assert.match(dialogueFlow, /const fetchDefaultFlow = useCallback\(async \(\) => \{\s*if \(authLoading \|\| !isWhatsAppConnected\) return;/s);
  assert.match(dialogueFlow, /api\.get\('\/api\/whatsappFlow'\)/);
  assert.match(dialogueFlow, /api\.get\('\/api\/whatsappFlow\/default\/current'\)/);
});

test("login background resolves through the public assets path", () => {
  assert.match(indexCss, /background:\s*url\("\/assets\/bg-login\.png"\)/);
  assert.equal(existsSync("public/assets/bg-login.png"), true);
});


test("notification permission is only requested by the explicit helper", () => {
  assert.match(app, /Notification\.permission === "granted"/);
  assert.match(app, /registerNotificationToken\(\s*auth\.user\._id\s*\)/s);
  assert.doesNotMatch(app, /requestPermission\(\s*auth\.user\._id\s*\)/s);
  assert.match(notification, /export const requestPermission/);
  assert.match(notification, /Notification\.requestPermission\(\)/);
  assert.match(notification, /export const registerNotificationToken/);
});

test("router future flags are configured for React Router v7 warnings", () => {
  assert.match(app, /<Router future=\{\{\s*v7_startTransition: true,\s*v7_relativeSplatPath: true\s*\}\}>/s);
});

test("Razorpay Checkout is not globally loaded on ordinary startup", () => {
  assert.doesNotMatch(indexHtml, /checkout\.razorpay\.com\/v1\/checkout\.js/);
});

test("Razorpay loader is idempotent and payment entry points use it", () => {
  assert.match(razorpayLoader, /let razorpayCheckoutPromise = null/);
  assert.match(razorpayLoader, /if \(window\.Razorpay\)/);
  assert.match(razorpayLoader, /if \(razorpayCheckoutPromise\)/);
  assert.match(razorpayLoader, /document\.querySelector\(/);
  assert.match(subscriptionPopup, /import \{ loadRazorpayCheckout \}/);
  assert.match(subscriptionPage, /import \{ loadRazorpayCheckout \}/);
  assert.match(whatsappCredits, /import \{ loadRazorpayCheckout \}/);
  assert.equal((subscriptionPopup.match(/await loadRazorpayCheckout\(\)/g) || []).length, 2);
  assert.equal((subscriptionPage.match(/await loadRazorpayCheckout\(\)/g) || []).length, 2);
  assert.equal((whatsappCredits.match(/await loadRazorpayCheckout\(\)/g) || []).length, 1);
});

test("Razorpay payment callbacks and verification payloads remain present", () => {
  for (const source of [subscriptionPopup, subscriptionPage]) {
    assert.match(source, /new window\.Razorpay\(options\)/);
    assert.match(source, /razorpay\.on\("payment\.failed"/);
    assert.match(source, /await verifyRazorpayPayment\(response, subscriptionId\)/);
    assert.match(source, /await verifyAddCreditsPayment\(response, subscriptionId\)/);
    assert.match(source, /razorpay_order_id: response\.razorpay_order_id/);
    assert.match(source, /razorpay_payment_id: response\.razorpay_payment_id/);
    assert.match(source, /razorpay_signature: response\.razorpay_signature/);
  }
  assert.match(whatsappCredits, /new window\.Razorpay\(options\)/);
  assert.match(whatsappCredits, /razorpayOrderId: razorpayResponse\.razorpay_order_id/);
  assert.match(whatsappCredits, /razorpayPaymentId: razorpayResponse\.razorpay_payment_id/);
  assert.match(whatsappCredits, /razorpaySignature: razorpayResponse\.razorpay_signature/);
});


test("notification permission has an explicit page action", () => {
  assert.match(notificationsPage, /onClick=\{handleEnablePushNotifications\}/);
  assert.match(notificationsPage, /await requestPermission\(auth\.user\._id\)/);
  assert.match(notificationsPage, /listenNotifications\(\)/);
});
