import { readFileSync, writeFileSync } from 'fs';

const indexPath = 'node_modules/.prisma/client/index.js';
let src = readFileSync(indexPath, 'utf8');

// 1. Patch ModelName enum — add Conversation and Message before closing }
if (!src.includes("Conversation: 'Conversation'")) {
  src = src.replace(
    "AuditLog: 'AuditLog'\n}",
    "AuditLog: 'AuditLog',\n  Conversation: 'Conversation',\n  Message: 'Message'\n}"
  );
  console.log('Patched ModelName enum');
} else {
  console.log('ModelName enum already patched');
}

// 2. Patch runtimeDataModel JSON
const marker = 'config.runtimeDataModel = JSON.parse("';
const start = src.indexOf(marker);
if (start === -1) throw new Error('runtimeDataModel marker not found');

const jsonStart = start + marker.length;

// Find end of the JSON string: look for unescaped " after jsonStart
let i = jsonStart;
while (i < src.length) {
  if (src[i] === '\\') { i += 2; continue; } // skip escaped char
  if (src[i] === '"') break; // unescaped quote = end of JS string
  i++;
}
const jsonEnd = i; // position of the closing "

// Extract the JS-escaped JSON and decode it to actual JSON
const escapedJson = src.slice(jsonStart, jsonEnd);
// Un-escape JS string encoding: \" → ", \\ → \
const actualJson = escapedJson.replace(/\\"/g, '"').replace(/\\\\/g, '\\');

const dm = JSON.parse(actualJson);

// Add relation fields to existing models
if (!dm.models.User.fields.find(f => f.name === 'conversationsAsCandidate')) {
  dm.models.User.fields.push(
    { name: 'conversationsAsCandidate', kind: 'object', type: 'Conversation', relationName: 'CandidateConversations' },
    { name: 'sentMessages', kind: 'object', type: 'Message', relationName: 'SentMessages' }
  );
  console.log('Added conversation/message relations to User');
}
if (!dm.models.EmployerProfile.fields.find(f => f.name === 'conversations')) {
  dm.models.EmployerProfile.fields.push(
    { name: 'conversations', kind: 'object', type: 'Conversation', relationName: 'ConversationToEmployerProfile' }
  );
  console.log('Added conversations relation to EmployerProfile');
}

// Add Conversation model
if (!dm.models.Conversation) {
  dm.models.Conversation = {
    fields: [
      { name: 'id', kind: 'scalar', type: 'String' },
      { name: 'candidateId', kind: 'scalar', type: 'String', dbName: 'candidate_id' },
      { name: 'employerProfileId', kind: 'scalar', type: 'String', dbName: 'employer_profile_id' },
      { name: 'lastMessageAt', kind: 'scalar', type: 'DateTime', dbName: 'last_message_at' },
      { name: 'createdAt', kind: 'scalar', type: 'DateTime', dbName: 'created_at' },
      { name: 'candidate', kind: 'object', type: 'User', relationName: 'CandidateConversations' },
      { name: 'employerProfile', kind: 'object', type: 'EmployerProfile', relationName: 'ConversationToEmployerProfile' },
      { name: 'messages', kind: 'object', type: 'Message', relationName: 'ConversationToMessage' },
    ],
    dbName: 'conversations',
  };
  console.log('Added Conversation model');
}

// Add Message model
if (!dm.models.Message) {
  dm.models.Message = {
    fields: [
      { name: 'id', kind: 'scalar', type: 'String' },
      { name: 'conversationId', kind: 'scalar', type: 'String', dbName: 'conversation_id' },
      { name: 'senderId', kind: 'scalar', type: 'String', dbName: 'sender_id' },
      { name: 'content', kind: 'scalar', type: 'String' },
      { name: 'type', kind: 'scalar', type: 'String' },
      { name: 'isRead', kind: 'scalar', type: 'Boolean', dbName: 'is_read' },
      { name: 'createdAt', kind: 'scalar', type: 'DateTime', dbName: 'created_at' },
      { name: 'conversation', kind: 'object', type: 'Conversation', relationName: 'ConversationToMessage' },
      { name: 'sender', kind: 'object', type: 'User', relationName: 'SentMessages' },
    ],
    dbName: 'messages',
  };
  console.log('Added Message model');
}

// Re-encode to JS string: " → \", \ → \\
const newJson = JSON.stringify(dm);
const reEncoded = newJson.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

// Replace the encoded JSON in the source
src = src.slice(0, jsonStart) + reEncoded + src.slice(jsonEnd);

writeFileSync(indexPath, src, 'utf8');
console.log('Done — node_modules/.prisma/client/index.js patched');

// Verify
const patched = readFileSync(indexPath, 'utf8');
if (patched.includes('"Conversation"') || patched.includes('\\"Conversation\\"')) {
  console.log('Verification: Conversation model found in patched file');
} else {
  console.log('WARNING: Conversation model NOT found — something went wrong');
}
