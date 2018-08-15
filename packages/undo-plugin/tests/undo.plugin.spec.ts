import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Action, NgxsModule, State, StateContext, Store } from '@ngxs/store';
import { NgxsUndoPluginModule, Redo, Undo, UndoableAction } from '@ngxs/undo-plugin';

class Increment {
  static readonly type = '[Counter] Increment';
}

class UndoableIncrement extends UndoableAction {
  static readonly type = '[Counter] Undoable Increment';

  constructor() {
    super();
  }
}

@State<number>({
  name: 'counter',
  defaults: 0
})
class CounterState {
  @Action([Increment, UndoableIncrement])
  increment(ctx: StateContext<number>) {
    const counter = ctx.getState();
    ctx.setState(counter + 1);
  }
}

describe('NgxsUndoPlugin', () => {
  let store: Store;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState]), NgxsUndoPluginModule.forRoot({ stackLimit: 3 })]
    }).compileComponents();
    store = TestBed.get(Store);
  }));

  it(
    'should ignore an Undo before an UndoableAction was dispatched',
    fakeAsync(() => {
      store.dispatch(new Undo());
      tick();
      expect(store.selectSnapshot(CounterState)).toBe(0);

      store.dispatch(new Increment());
      tick();
      expect(store.selectSnapshot(CounterState)).toBe(1);

      store.dispatch(new Undo());
      tick();
      expect(store.selectSnapshot(CounterState)).toBe(1);
    })
  );

  it(
    'should ignore a Redo before an UndoableAction was dispatched',
    fakeAsync(() => {
      store.dispatch(new Redo());
      tick();
      expect(store.selectSnapshot(CounterState)).toBe(0);

      store.dispatch(new Increment());
      tick();
      expect(store.selectSnapshot(CounterState)).toBe(1);

      store.dispatch(new Redo());
      tick();
      expect(store.selectSnapshot(CounterState)).toBe(1);
    })
  );

  it(
    'should undo and immediately redo an UndoableAction',
    fakeAsync(() => {
      store.dispatch(new UndoableIncrement());
      tick();
      expect(store.selectSnapshot(CounterState)).toBe(1);

      store.dispatch(new Undo());
      tick();
      expect(store.selectSnapshot(CounterState)).toBe(0);

      store.dispatch(new Redo());
      tick();
      expect(store.selectSnapshot(CounterState)).toBe(1);
    })
  );

  it(
    'should undo and later redo an UndoableAction',
    fakeAsync(() => {
      store.dispatch(new UndoableIncrement());
      tick();
      expect(store.selectSnapshot(CounterState)).toBe(1);

      store.dispatch(new Undo());
      tick();
      expect(store.selectSnapshot(CounterState)).toBe(0);

      store.dispatch(new Increment());
      tick();
      expect(store.selectSnapshot(CounterState)).toBe(1);

      store.dispatch(new Increment());
      tick();
      expect(store.selectSnapshot(CounterState)).toBe(2);

      store.dispatch(new Redo());
      tick();
      expect(store.selectSnapshot(CounterState)).toBe(1);
    })
  );

  it(
    'should only be possible to undo #stackLimit UndoableActions',
    fakeAsync(() => {
      store.dispatch(new UndoableIncrement());
      store.dispatch(new UndoableIncrement());
      store.dispatch(new UndoableIncrement());
      store.dispatch(new UndoableIncrement());
      store.dispatch(new UndoableIncrement());
      tick();
      expect(store.selectSnapshot(CounterState)).toBe(5);

      store.dispatch(new Undo());
      store.dispatch(new Undo());
      store.dispatch(new Undo());
      store.dispatch(new Undo());
      store.dispatch(new Undo());
      tick();
      expect(store.selectSnapshot(CounterState)).toBe(2);

      store.dispatch(new Redo());
      store.dispatch(new Redo());
      store.dispatch(new Redo());
      store.dispatch(new Redo());
      store.dispatch(new Redo());
      tick();
      expect(store.selectSnapshot(CounterState)).toBe(5);
    })
  );
});
