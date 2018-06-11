import { Injectable, Inject } from '@angular/core';
import { NgxsPlugin, actionMatcher } from '@ngxs/store';

import { NGXS_UNDO_PLUGIN_OPTIONS } from './options';
import { UndoableAction, Undo, Redo } from './actions';

@Injectable()
export class NgxsUndoPlugin implements NgxsPlugin {
  private undoStack: any[] = [];
  private redoStack: any[] = [];

  constructor(@Inject(NGXS_UNDO_PLUGIN_OPTIONS) private options: any = { stackLimit: 25 }) {}

  handle(state, action, next) {
    const matches = actionMatcher(action);
    const isUndoAction = matches(Undo);
    const isRedoAction = matches(Redo);

    if (isUndoAction && this.undoStack.length > 1) {
      const newState = this.undoStack.pop();
      this.redoStack.push(newState);
      return next(newState, action);
    } else if (isUndoAction) {
      return next(this.undoStack[0], action);
    }

    if (isRedoAction && this.redoStack.length > 0) {
      const newState = this.redoStack.pop();
      this.undoStack.push(newState);
      return next(newState, action);
    }

    if (action instanceof UndoableAction) {
      const newState = next(state, action);
      this.undoStack.push(newState);
      if (this.options.stackLimit < this.undoStack.length) {
        this.undoStack.splice(1, 1);
      }
      return newState;
    }

    // if we don't have an undo history here, we need to keep updating the base state
    if (this.undoStack.length < 2) {
      const newState = next(state, action);
      this.undoStack[0] = newState;
      return newState;
    }

    return next(state, action);
  }
}
