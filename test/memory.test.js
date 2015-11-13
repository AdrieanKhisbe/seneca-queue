
var queue = require('..')
var seneca = require('seneca')
var expect = require('code').expect

var Lab = require('lab')
var lab = exports.lab = Lab.script()
var describe = lab.describe
var it = lab.it
var beforeEach = lab.beforeEach

describe('seneca queue', function () {
  describe('Basics', function () {
    var s

    beforeEach(function (done) {
      s = seneca({log: 'silent'})
        .use(queue)
        .ready(done)
    })

    it('should process a task', function (done) {
      var task = {
        task: 'my task',
        param: 42
      }

      s.add({
        task: 'my task'
      }, function (args, cb) {
        expect(args).to.include(task)
        cb()
        done()
      })

      s.act({ role: 'queue', cmd: 'start' }, function (err) {
        if (err) { return done(err) }
        s.act({ role: 'queue', cmd: 'enqueue', msg: task }, function (err) {
          if (err) { return done(err) }
        })
      })
    })

    it('should not process a task until start is called', function (done) {
      var task = {
        task: 'my task',
        param: 42
      }

      // first enqueing
      s.act({ role: 'queue', cmd: 'enqueue', msg: task })

      // then we add the task handler
      s.add({
        task: 'my task'
      }, function (args, cb) {
        expect(args).to.include(task)
        cb()
        done()
      })

      // finally we start the worker
      s.act({ role: 'queue', cmd: 'start' })
    })

    it('should stop a worker', function (done) {
      var task = {
        task: 'my task',
        param: 42
      }

      s.add({
        task: 'my task'
      }, function (args, cb) {
        cb()
        done(new Error('this should never be called'))
      })

      s.act({ role: 'queue', cmd: 'start' })
      s.act({ role: 'queue', cmd: 'stop' })
      s.act({ role: 'queue', cmd: 'enqueue', msg: task }, done)
    })

    it('should restart a worker', function (done) {
      var task = {
        task: 'my task',
        param: 42
      }

      s.add({
        task: 'my task'
      }, function (args, cb) {
        expect(args).to.include(task)
        cb()
        done()
      })

      s.act({ role: 'queue', cmd: 'start' })
      s.act({ role: 'queue', cmd: 'stop' })
      s.act({ role: 'queue', cmd: 'enqueue', msg: task })
      s.act({ role: 'queue', cmd: 'start' })
    })
  })
})
