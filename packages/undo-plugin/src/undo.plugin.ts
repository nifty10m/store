import { Inject, Injectable } from '@angular/core';
import { actionMatcher, NgxsPlugin } from '@ngxs/store';
import { NgxsUndoPluginOptions } from '@ngxs/undo-plugin/src/options';
import { tap } from 'rxjs/operators';
import { Redo, Undo, UndoableAction } from './actions';

import { NGXS_UNDO_PLUGIN_OPTIONS } from './options';

@Injectable()
export class NgxsUndoPlugin implements NgxsPlugin {
  private undoStack: any[] = [];
  private currentState: any;
  private redoStack: any[] = [];

  constructor(@Inject(NGXS_UNDO_PLUGIN_OPTIONS) private options: NgxsUndoPluginOptions = { stackLimit: 25 }) {}

  handle(state, action, next) {
    const matches = actionMatcher(action);
    const isUndoAction = matches(Undo);
    const isRedoAction = matches(Redo);

    if (isUndoAction && this.undoStack.length) {
      this.redoStack.unshift(this.currentState);
      this.currentState = this.undoStack.shift();
      return next(this.currentState, action);
    } else if (isRedoAction && this.redoStack.length) {
      this.undoStack.unshift(this.currentState);
      this.currentState = this.redoStack.shift();
      return next(this.currentState, action);
    } else if (action instanceof UndoableAction) {
      return next(state, action).pipe(
        tap(newState => {
          this.undoStack.unshift(this.currentState);
          if (this.options.stackLimit < this.undoStack.length) {
            this.undoStack.length = this.options.stackLimit;
          }
          this.currentState = newState;
          this.redoStack = [];
        })
      );
    } else {
      return next(state, action).pipe(tap(newState => (this.currentState = newState)));
    }
  }
}
