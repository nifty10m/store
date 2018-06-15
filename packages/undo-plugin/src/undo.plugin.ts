import { Inject, Injectable } from '@angular/core';
import { actionMatcher, NgxsPlugin } from '@ngxs/store';
import { NgxsUndoPluginOptions } from '@ngxs/undo-plugin/src/options';
import { tap } from 'rxjs/operators';
import { Redo, Undo, UndoableAction } from './actions';

import { NGXS_UNDO_PLUGIN_OPTIONS } from './options';

@Injectable()
export class NgxsUndoPlugin implements NgxsPlugin {
  private undoStack: any[] = [];
  private redoStack: any[] = [];

  constructor(@Inject(NGXS_UNDO_PLUGIN_OPTIONS) private options: NgxsUndoPluginOptions = { stackLimit: 25 }) {}

  handle(state, action, next) {
    const matches = actionMatcher(action);
    const isUndoAction = matches(Undo);
    const isRedoAction = matches(Redo);

    if (isUndoAction && this.undoStack.length > 1) {
      const newState = this.undoStack.pop();
      this.redoStack.push(newState);
      return next(this.undoStack[this.undoStack.length - 1], action);
    } else if (isUndoAction) {
      return next(this.undoStack[0], action);
    }

    if (isRedoAction && this.redoStack.length > 0) {
      const newState = this.redoStack.pop();
      this.undoStack.push(newState);
      return next(newState, action);
    }

    if (action instanceof UndoableAction) {
      return next(state, action).pipe(
        tap(newState => {
          this.undoStack.push(newState);
          if (this.options.stackLimit < this.undoStack.length) {
            this.undoStack.splice(0, 1);
          }
        })
      );
    }

    // if we don't have an undo history here, we need to keep updating the base state
    if (this.undoStack.length < 2) {
      return next(state, action).pipe(tap(newState => (this.undoStack[0] = newState)));
    }

    return next(state, action);
  }
}
