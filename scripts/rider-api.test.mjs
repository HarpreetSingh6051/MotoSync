import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=readFileSync(new URL('../lib/riderApi.ts',import.meta.url),'utf8');
function client({session={access_token:'test-token'},reply=[],status=200,invalidJson=false,networkError}={}){
 const calls=[];
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const context={exports:{},require:(name)=>name==='./environment'?{apiUrl:path=>'https://api.example/'+path}:{supabase:{auth:{getSession:async()=>({data:{session},error:null})}}},AbortController,setTimeout,clearTimeout,fetch:async(url,options)=>{calls.push({url,options});if(networkError)throw networkError;return {ok:status<400,status,json:async()=>{if(invalidJson)throw Error('invalid');return reply}}}};
 vm.runInNewContext(code,context);return {request:context.exports.riderRequest,calls};
}
test('empty live results remain empty with authenticated API requests',async()=>{const c=client();assert.deepEqual(await c.request('rider/feed/rides?page=1'),[]);assert.equal(c.calls[0].options.headers.Authorization,'Bearer test-token');assert.equal(c.calls.length,1)});
test('maintenance propagates without sample fallback or repeated requests',async()=>{const c=client({status:503,reply:{message:'Maintenance'}});await assert.rejects(c.request('rider/feed/clubs'),/Maintenance/);assert.equal(c.calls.length,1)});
test('signed-out calls do not hit the network',async()=>{const c=client({session:null});await assert.rejects(c.request('rider/me'),/Sign in/);assert.equal(c.calls.length,0)});
test('actions POST JSON and preserve server failures',async()=>{const c=client({status:400,reply:{message:'This ride is full'}});await assert.rejects(c.request('rider/actions',{operation:'join_ride',target_id:'id'}),/full/);assert.equal(c.calls[0].options.method,'POST');assert.equal(JSON.parse(c.calls[0].options.body).operation,'join_ride')});
test('invalid JSON is rejected',async()=>{const c=client({invalidJson:true});await assert.rejects(c.request('rider/me'),/invalid response/)});
test('transport failures propagate without invented records',async()=>{const c=client({networkError:new Error('Offline')});await assert.rejects(c.request('rider/feed/rides'),/Offline/);assert.equal(c.calls.length,1)});
