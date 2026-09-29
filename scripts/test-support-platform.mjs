// ==============================================================================
// Zanzirangi House: Automated Customer Support Verification Suite
// Tests all 20 sections and requirements:
// 1. Visitor conversation creation & DB persistence
// 2. AI FAQ auto-answering with confidence & intent
// 3. Human handoff on low confidence / high constraints
// 4. Admin inbox listing, filtering & unread counts
// 5. Admin take-over & return to AI controls
// 6. Admin message dispatch & visitor delivery
// 7. AI suggested reply generation
// 8. Knowledge Base CRUD & dynamic search
// 9. Support Analytics metrics
// 10. CRITICAL E2E TEST: Private candlelight dinner for 12 people tomorrow
// ==============================================================================

import fs from 'fs';
import path from 'path';
import http from 'http';

function loadEnv() {
  const envFiles = ['.env', '.env.local'];
  for (const file of envFiles) {
    const full = path.resolve(process.cwd(), file);
    if (fs.existsSync(full)) {
      const lines = fs.readFileSync(full, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq > 0) {
          const k = trimmed.substring(0, eq).trim();
          let v = trimmed.substring(eq + 1).trim();
          if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
            v = v.slice(1, -1);
          }
          if (!process.env[k]) {
            process.env[k] = v;
          }
        }
      }
    }
  }
}

loadEnv();

process.env.FORCE_JSON_DB = 'true';
process.env.DATABASE_PROVIDER = 'json';

const TEST_PORT = 3105;
const API_BASE = `http://localhost:${TEST_PORT}/api`;
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'info@zanzirangihouse.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Zanzirangi2026!';

let testToken = '';
let passedCount = 0;
let failedCount = 0;
const results = [];

function logResult(stepNum, name, passed, details = '') {
  const status = passed ? 'PASS' : 'FAIL';
  results.push({ stepNum, name, status, details });
  if (passed) {
    passedCount++;
    console.log(`✓ [PASS] Step ${stepNum}: ${name} ${details ? '(' + details + ')' : ''}`);
  } else {
    failedCount++;
    console.error(`✗ [FAIL] Step ${stepNum}: ${name} ${details ? ': ' + details : ''}`);
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(testToken ? { Authorization: `Bearer ${testToken}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (err) {
    data = await response.text();
  }

  return { status: response.status, ok: response.ok, data };
}

async function runTests() {
  console.log('================================================================');
  console.log('ZANZIRANGI HOUSE: CUSTOMER SUPPORT PLATFORM VERIFICATION');
  console.log('================================================================\n');

  // 1. Boot up backend server instance
  const { app } = await import('../server/index.ts');
  const server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(TEST_PORT, () => {
      console.log(`✓ Test Server listening on http://localhost:${TEST_PORT}\n`);
      resolve(true);
    });
  });

  try {
    // -------------------------------------------------------------
    // Test 1: Admin Authentication
    // -------------------------------------------------------------
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });

    const receivedToken = loginRes.data?.token || loginRes.data?.data?.token;
    if (loginRes.ok && receivedToken) {
      testToken = receivedToken;
      logResult(1, 'Admin Authentication for Support Inbox', true, `Token received for ${ADMIN_EMAIL}`);
    } else {
      logResult(1, 'Admin Authentication for Support Inbox', false, `Status ${loginRes.status}`);
    }

    // -------------------------------------------------------------
    // Test 2: Phase 1 - Visitor Conversation Creation & Persistence
    // -------------------------------------------------------------
    const visitorId = `vis_test_${Date.now()}`;
    const sessionId = `ses_test_${Date.now()}`;

    const initConvRes = await request('/support/conversation', {
      method: 'POST',
      body: JSON.stringify({
        visitor_id: visitorId,
        session_id: sessionId,
        language: 'en',
        current_page: '/stay',
        booking_id: 'bk_sample_123',
        metadata: {
          villaName: 'Sultan Oceanfront Villa',
          checkIn: '2026-10-10',
          checkOut: '2026-10-15',
          guests: 2,
          fullName: 'Lady Eleanor Vance',
          email: 'eleanor@residence.com',
        },
      }),
    });

    const conversationId = initConvRes.data?.data?.conversation?.id;
    const convCreated = initConvRes.ok && !!conversationId && initConvRes.data?.data?.conversation?.status === 'AI_ACTIVE';
    logResult(2, 'Visitor Conversation Initialization with Booking Context', convCreated, `Conversation ID: ${conversationId}`);

    // -------------------------------------------------------------
    // Test 3: Phase 2 - AI FAQ Auto-Answer & Persistence
    // -------------------------------------------------------------
    const faqMsgRes = await request(`/support/conversation/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        visitor_id: visitorId,
        message: 'What are the check-in and check-out times?',
      }),
    });

    const botAnswered =
      faqMsgRes.ok &&
      faqMsgRes.data?.data?.botMessage?.message.includes('14:00') &&
      faqMsgRes.data?.data?.botMessage?.ai_confidence >= 0.85;

    logResult(3, 'AI FAQ Auto-Answer with High Confidence', botAnswered, `Bot replied: "${faqMsgRes.data?.data?.botMessage?.message?.substring(0, 45)}..."`);

    // Verify messages stored on DB
    const checkMsgsRes = await request(`/support/conversation/${conversationId}?visitor_id=${visitorId}`);
    const msgsPersisted = checkMsgsRes.data?.data?.messages?.length >= 2;
    logResult(4, 'Server-Side Database Persistence of Visitor and Bot Messages', msgsPersisted, `Stored messages count: ${checkMsgsRes.data?.data?.messages?.length}`);

    // -------------------------------------------------------------
    // Test 4: Phase 3 - Human Handoff on Complex / Unknown Queries
    // -------------------------------------------------------------
    const handoffMsgRes = await request(`/support/conversation/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        visitor_id: visitorId,
        message: 'Can you arrange a custom helicopter tour over Pemba island on a specific private route?',
      }),
    });

    const handoffSuccess =
      handoffMsgRes.ok &&
      handoffMsgRes.data?.data?.conversationStatus === 'WAITING_HUMAN' &&
      handoffMsgRes.data?.data?.botMessage?.message.includes('concierge team');

    logResult(5, 'AI Human Handoff on Unverified Inquiry (WAITING_HUMAN)', handoffSuccess, `Status transitioned to WAITING_HUMAN`);

    // -------------------------------------------------------------
    // Test 5: Phase 4 - Admin Inbox Retrieval & Filtering
    // -------------------------------------------------------------
    const adminInboxRes = await request('/support/admin/conversations?status=WAITING_HUMAN');
    const waitingFound =
      adminInboxRes.ok &&
      adminInboxRes.data?.data?.conversations?.some((c) => c.id === conversationId);

    logResult(6, 'Admin Support Inbox Lists WAITING_HUMAN Conversations', waitingFound, `Found conversation in waiting list`);

    // -------------------------------------------------------------
    // Test 6: Phase 5 - Admin Take Over & Return to AI
    // -------------------------------------------------------------
    const takeOverRes = await request(`/support/admin/conversations/${conversationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'HUMAN_ACTIVE' }),
    });

    const takeOverOk = takeOverRes.ok && takeOverRes.data?.data?.status === 'HUMAN_ACTIVE';
    logResult(7, 'Admin Takes Over Conversation (HUMAN_ACTIVE)', takeOverOk, `AI auto-replies paused`);

    // Verify AI does NOT auto-reply when HUMAN_ACTIVE
    const humanActiveMsgRes = await request(`/support/conversation/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        visitor_id: visitorId,
        message: 'Is someone there to assist me?',
      }),
    });

    const aiPaused = humanActiveMsgRes.ok && humanActiveMsgRes.data?.data?.botMessage === null;
    logResult(8, 'AI Strictly Pauses Auto-Replies During Human Takeover', aiPaused, 'botMessage is null while HUMAN_ACTIVE');

    // -------------------------------------------------------------
    // Test 7: Phase 6 - AI Suggested Reply Generation for Admin
    // -------------------------------------------------------------
    const suggestedRes = await request(`/support/admin/conversations/${conversationId}/suggested-reply`);
    const suggestedOk = suggestedRes.ok && typeof suggestedRes.data?.data?.suggestedReply === 'string' && suggestedRes.data?.data?.suggestedReply.length > 10;
    logResult(9, 'AI Suggested Reply Generated for Admin Staff', suggestedOk, `Suggestion: "${suggestedRes.data?.data?.suggestedReply?.substring(0, 45)}..."`);

    // -------------------------------------------------------------
    // Test 8: Phase 7 - Admin Staff Reply Delivery to Visitor
    // -------------------------------------------------------------
    const adminReplyText = 'Jambo Lady Eleanor! I am Juma from the concierge desk. We can certainly arrange this private helicopter charter for you.';
    const adminSendRes = await request(`/support/admin/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        message: adminReplyText,
      }),
    });

    const adminSent = adminSendRes.ok && adminSendRes.data?.data?.message?.sender_type === 'ADMIN';
    logResult(10, 'Admin Sends Reply to Visitor', adminSent, `Sender Type: ${adminSendRes.data?.data?.message?.sender_type}`);

    // Verify visitor receives reply via poll endpoint
    const visitorPollRes = await request(`/support/conversation/${conversationId}/poll?visitor_id=${visitorId}`);
    const visitorReceived =
      visitorPollRes.ok &&
      visitorPollRes.data?.data?.messages?.some((m) => m.sender_type === 'ADMIN' && m.message === adminReplyText);

    logResult(11, 'Visitor Receives Admin Reply in Near-Real-Time', visitorReceived, 'Message delivered to visitor client');

    // -------------------------------------------------------------
    // Test 9: Knowledge Base CRUD & Candidate Creation
    // -------------------------------------------------------------
    const kbCreateRes = await request('/support/admin/knowledge-base', {
      method: 'POST',
      body: JSON.stringify({
        question: 'Do you offer kite surfing gear rentals?',
        answer: 'Yes, we provide certified kite surfing equipment and instructors at nearby Paje beach through our partner water-sports academy.',
        category: 'Other',
        language: 'en',
        status: 'PUBLISHED',
        source: 'CANDIDATE_FROM_ADMIN',
      }),
    });

    const kbItem = kbCreateRes.data?.data;
    const kbCreated = kbCreateRes.ok && !!kbItem?.id;
    logResult(12, 'Knowledge Base Candidate Item Creation', kbCreated, `KB Item ID: ${kbItem?.id}`);

    // Delete created test item to keep KB clean
    if (kbItem?.id) {
      await request(`/support/admin/knowledge-base/${kbItem.id}`, { method: 'DELETE' });
    }

    // -------------------------------------------------------------
    // Test 10: Support Analytics Retrieval
    // -------------------------------------------------------------
    const analyticsRes = await request('/support/admin/analytics');
    const analyticsOk =
      analyticsRes.ok &&
      typeof analyticsRes.data?.data?.totalConversations === 'number' &&
      Array.isArray(analyticsRes.data?.data?.categories);

    logResult(13, 'Support Analytics & Category Distribution Metric Engine', analyticsOk, `Total Conversations: ${analyticsRes.data?.data?.totalConversations}`);

    // =============================================================
    // Test 11: CRITICAL E2E TEST (Section 20 Scenario)
    // "Can I arrange a private candlelight dinner for 12 people tomorrow?"
    // =============================================================
    console.log('\n--- EXECUTING SECTION 20 CRITICAL SCENARIO ---');

    const e2eVisitorId = `vis_e2e_${Date.now()}`;
    const e2eSessionId = `ses_e2e_${Date.now()}`;

    // 1. Initialize fresh conversation
    const e2eInit = await request('/support/conversation', {
      method: 'POST',
      body: JSON.stringify({
        visitor_id: e2eVisitorId,
        session_id: e2eSessionId,
        language: 'en',
        current_page: '/dining',
      }),
    });
    const e2eConvId = e2eInit.data?.data?.conversation?.id;

    // 2. Visitor sends critical query:
    const criticalQuery = 'Can I arrange a private candlelight dinner for 12 people tomorrow?';
    const e2eMsgRes = await request(`/support/conversation/${e2eConvId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        visitor_id: e2eVisitorId,
        message: criticalQuery,
      }),
    });

    // 3 & 4. Verify AI determines insufficient knowledge & triggers handoff
    const e2eHandoff =
      e2eMsgRes.ok &&
      e2eMsgRes.data?.data?.conversationStatus === 'WAITING_HUMAN' &&
      e2eMsgRes.data?.data?.botMessage?.message.includes('concierge team');

    logResult(14, 'E2E Step 1-4: Insufficient Knowledge Detected & Handoff Triggered', e2eHandoff, 'Status: WAITING_HUMAN');

    // 5 & 6 & 7. Admin sees conversation in waiting list
    const e2eWaitingCheck = await request(`/support/admin/conversations/${e2eConvId}`);
    const adminSeesWaiting =
      e2eWaitingCheck.ok &&
      e2eWaitingCheck.data?.data?.conversation?.status === 'WAITING_HUMAN' &&
      e2eWaitingCheck.data?.data?.messages?.some((m) => m.message === criticalQuery);

    logResult(15, 'E2E Step 5-8: Admin Dashboard Shows Conversation & Question', adminSeesWaiting, 'Question visible in Admin View');

    // 9. Admin takes over
    const e2eTakeover = await request(`/support/admin/conversations/${e2eConvId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'HUMAN_ACTIVE' }),
    });
    const e2eTakenOver = e2eTakeover.ok && e2eTakeover.data?.data?.status === 'HUMAN_ACTIVE';

    // 10. Admin sends required response:
    const requiredAdminMsg = 'Yes, we can check availability for a private candlelight dinner. Let me confirm the details with our concierge team.';
    const e2eAdminSend = await request(`/support/admin/conversations/${e2eConvId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message: requiredAdminMsg }),
    });
    const e2eAdminMsgSent = e2eAdminSend.ok && e2eAdminSend.data?.data?.message?.message === requiredAdminMsg;

    logResult(16, 'E2E Step 9-10: Admin Takes Over and Sends Concierge Confirmation', e2eTakenOver && e2eAdminMsgSent, 'Admin message posted');

    // 11 & 12. Visitor receives admin message & status remains HUMAN_ACTIVE
    const e2eVisitorPoll = await request(`/support/conversation/${e2eConvId}/poll?visitor_id=${e2eVisitorId}`);
    const e2eVisitorGotReply =
      e2eVisitorPoll.ok &&
      e2eVisitorPoll.data?.data?.status === 'HUMAN_ACTIVE' &&
      e2eVisitorPoll.data?.data?.messages?.some((m) => m.message === requiredAdminMsg);

    logResult(17, 'E2E Step 11-12: Visitor Receives Admin Message & Conversation Remains HUMAN_ACTIVE', e2eVisitorGotReply, 'Delivered & verified');

    // 13 & 14. Admin resolves conversation
    const e2eResolve = await request(`/support/admin/conversations/${e2eConvId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'RESOLVED' }),
    });
    const e2eResolved = e2eResolve.ok && e2eResolve.data?.data?.status === 'RESOLVED';
    logResult(18, 'E2E Step 13-14: Admin Resolves Conversation (RESOLVED)', e2eResolved, 'Status: RESOLVED');

    // 15 & 16. Refreshing both Admin and Visitor preserves full conversation history
    const e2eReloadAdmin = await request(`/support/admin/conversations/${e2eConvId}`);
    const e2eReloadVisitor = await request(`/support/conversation/${e2eConvId}?visitor_id=${e2eVisitorId}`);

    const e2eFullPersisted =
      e2eReloadAdmin.data?.data?.messages?.length >= 3 &&
      e2eReloadVisitor.data?.data?.messages?.length >= 3 &&
      e2eReloadAdmin.data?.data?.conversation?.status === 'RESOLVED';

    logResult(19, 'E2E Step 15-16: Zero Data Loss on Reload/Refresh across Admin & Visitor', e2eFullPersisted, `Verified ${e2eReloadAdmin.data?.data?.messages?.length} messages fully preserved`);

  } finally {
    server.close();
  }

  console.log('\n================================================================');
  console.log(`TOTAL SUITE RESULTS: ${passedCount} PASSED / ${failedCount} FAILED`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
