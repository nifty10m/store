export class Undo {
  static readonly type = '[UndoPlugin] Undo';
}

export class Redo {
  static readonly type = '[UndoPlugin] Redo';
}

export abstract class UndoableAction {}
