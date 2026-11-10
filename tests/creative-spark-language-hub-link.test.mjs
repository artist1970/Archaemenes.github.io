import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('strict CSP remains fail-closed for off-origin scripts and fetches',()=>{
 assert.match(html,/script-src 'self';/);
 assert.match(html,/connect-src 'self';/);
 assert.doesNotMatch(html,/src="https:\/\/artist1970\.github\.io\/creative-spark\.github\.io\/language-laboratory\/mentor-language-hub-v1\.js"/);
});
test('public language laboratory is reachable through an explicit source link',()=>{
 assert.match(html,/id="archaemenes-creative-spark-reference"/);
 assert.match(html,/href="https:\/\/artist1970\.github\.io\/creative-spark\.github\.io\/language-laboratory\/\?mentor=archaemenes"/);
 assert.match(html,/rel="noopener noreferrer"/);
 assert.match(html,/no messages or student details are transferred/);
});
test('existing Archaemenes chat and voice controls remain intact',()=>{
 for(const key of ['id="archaemenesConversation"','id="archaemenes-chat-input"','archaemenes-conversation.js','mentor-voice-addon-v1.js'])assert.ok(html.includes(key),key);
});
