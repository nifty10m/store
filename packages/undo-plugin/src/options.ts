import { InjectionToken } from '@angular/core';

export const NGXS_UNDO_PLUGIN_OPTIONS = new InjectionToken<NgxsUndoPluginOptions>('NGXS_UNDO_PLUGIN_OPTIONS');

export interface NgxsUndoPluginOptions {
  stackLimit: number;
}
