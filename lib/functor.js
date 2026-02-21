class TestFn extends Function {
  constructor() {
    super('return arguments.callee.own(...arguments)');
  }

  own(...args) {
    console.log(...args);
  }
}

const fn = new TestFn();

fn({ test: 'test' });
