import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scriptMatch = /<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/i.exec(html);
assert.ok(scriptMatch, 'application script not found');

const bootAt = scriptMatch[1].lastIndexOf('if(document.readyState');
const closeAt = scriptMatch[1].lastIndexOf('})();');
assert.ok(bootAt > 0 && closeAt > bootAt, 'test injection points not found');

const exportBlock = `
globalThis.__WW_TEST__ = {
  createState, computeDeaths, killSeat, calculateWinner, updateWin,
  nightActors, getState: () => state, setState: value => { state = value; },
  recomputeCensus, doExile, startNewNight, eligibleVoters, ROLES
};
`;
const script = scriptMatch[1].slice(0, bootAt) + exportBlock + scriptMatch[1].slice(closeAt);

function elementStub(){
  return {
    className:'', textContent:'', innerHTML:'', style:{}, parentNode:null,
    appendChild(){}, remove(){}, querySelector(){ return null; },
    querySelectorAll(){ return []; }
  };
}

const context = {
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  TextEncoder,
  TextDecoder,
  AbortController,
  btoa,
  atob,
  crypto: globalThis.crypto,
  location:{hash:''},
  navigator:{},
  localStorage:{getItem(){return null;},setItem(){},removeItem(){}},
  confirm(){return true;},
  document:{
    readyState:'complete',
    body:{appendChild(){}},
    getElementById(){return null;},
    querySelector(){return null;},
    querySelectorAll(){return [];},
    addEventListener(){},
    createElement(){return elementStub();}
  },
  window:{crypto:globalThis.crypto}
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(script, context, {filename:'index.inline.js'});

const api = context.__WW_TEST__;

function setState(cfg){
  api.setState(api.createState(cfg));
  return api.getState();
}

test('same-night wolf kill and poison preserve both causes and block hunter shot', () => {
  const state = setState({
    key:'custom', name:'hunter-test', total:4,
    wolves:['wolf'], gods:['hunter'], extra:[]
  });
  const hunter = state.players.find(player => player.role === 'hunter');
  state.night.kill = hunter.seat;
  state.night.poison = hunter.seat;
  const deaths = api.computeDeaths();
  assert.equal(deaths.length, 1);
  assert.equal(deaths[0].causes.slice().sort().join(','), 'poison,wolf');
  assert.equal(deaths[0].cause, 'poison');
  api.killSeat(hunter.seat, deaths[0].causes, {deferWin:true, render:false});
  assert.equal(state.pendingShot, null);
  assert.equal(state.players.find(player => player.seat === hunter.seat).death.causes.slice().sort().join(','), 'poison,wolf');
});

test('winner is based on the final living set', () => {
  const state = setState({
    key:'custom', name:'last-wolf-test', total:3,
    wolves:['wolf'], gods:['seer'], extra:[]
  });
  state.players.forEach(player => { player.alive = false; });
  api.recomputeCensus();
  const result = api.calculateWinner();
  assert.equal(result.winner, 'good');
});

test('pending shot defers winner calculation', () => {
  const state = setState('std12');
  state.players.forEach((player, index) => { player.alive = index === 0; });
  state.pendingShot = {seat:1, type:'hunter'};
  assert.equal(api.calculateWinner(), null);
});

test('startNewNight cannot clear or bypass an existing win', () => {
  const state = setState('std12');
  state.win = {winner:'good', text:'好人阵营胜利'};
  const day = state.day;
  state.pendingShot = null;
  api.startNewNight();
  assert.equal(state.day, day);
  assert.equal(state.win.winner, 'good');
});

test('exile rejects a vote whose target is dead', () => {
  const state = setState('std12');
  state.phase = 'day';
  state.stepKey = 'exile';
  state.players[0].alive = false;
  state.players[0].death = {day:1, phase:'night', cause:'wolf', causes:['wolf']};
  state.votes = {1:1};
  state.voteRecords = [{voterSeat:2, targetSeat:1, round:1}];
  api.doExile();
  assert.equal(state.exileResolved, false);
  assert.equal(state.players[0].alive, false);
});

test('duplicate custom roles receive independent night steps', () => {
  const state = setState({
    key:'custom', name:'duplicate-custom-test', total:4,
    wolves:['wolf'], gods:[],
    extra:[{key:'cx0', name:'双生神', camp:'god', count:2, wake:true, order:5.5}]
  });
  const actors = api.nightActors().filter(actor => actor.role === 'cx0');
  assert.equal(actors.length, 2);
  assert.equal(new Set(actors.map(actor => actor.key)).size, 2);
});

test('oversized custom configuration is rejected', () => {
  assert.throws(() => api.createState({
    key:'custom', name:'oversized-custom-test', total:4,
    wolves:['wolf'], gods:[],
    extra:[{key:'cx0', name:'超员神', camp:'god', count:6, wake:false}]
  }), /超过设置人数/);
});

test('white idiot remains eligible to speak but loses voting eligibility', () => {
  const state = setState('std12');
  const idiot = state.players.find(player => player.role === 'idiot');
  idiot.tags.push('novote');
  assert.equal(api.eligibleVoters().some(player => player.seat === idiot.seat), false);
});
