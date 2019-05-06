/* eslint-env node, mocha */
'use strict'

const assert = require('assert')
const mock = require('mock-require')
const sinon = require('sinon')

const { makeMockSocket } = require('./utils')

describe('realtime#disconnect', function () {
  it('should disconnect success', function (done) {
    mock('../../lib/logger', {
      error: () => {
      }
    })
    mock('../../lib/history', {})
    mock('../../lib/models', {
      Revision: {
        saveAllNotesRevision: () => {
        }
      }
    })
    mock('../../lib/config', {})
    const noteId = 'note1_id'
    const realtime = require('../../lib/realtime')
    const updateNoteStub = sinon.stub(realtime, 'updateNote').callsFake((note, callback) => {
      callback(null, note)
    })
    const emitOnlineUsersStub = sinon.stub(realtime, 'emitOnlineUsers')
    let client = makeMockSocket()
    client.noteId = noteId

    realtime.users[client.id] = {
      id: client.id,
      color: '#ff0000',
      cursor: null,
      login: false,
      userid: null,
      name: null,
      idle: false,
      type: null
    }

    realtime.getNotePool()[noteId] = {
      id: noteId,
      server: {
        isDirty: true
      },
      users: {
        [client.id]: realtime.users[client.id]
      },
      socks: [client]
    }

    realtime.disconnectSocketQueue.push(client)

    realtime.disconnect(client)

    setTimeout(() => {
      assert(typeof realtime.users[client.id] === 'undefined')
      assert(emitOnlineUsersStub.called)
      assert(updateNoteStub.called)
      assert(realtime.disconnectSocketQueue.length === 0)
      assert(Object.keys(realtime.users).length === 0)
      assert(Object.keys(realtime.notes).length === 0)
      done()
    }, 5)
  })

})
