import { ModuleWithProviders, NgModule } from '@angular/core';
import { NGXS_PLUGINS } from '@ngxs/store';
import { NgxsUndoPluginOptions } from '@ngxs/undo-plugin/src/options';

import { NgxsUndoPlugin } from './undo.plugin';
import { NGXS_UNDO_PLUGIN_OPTIONS } from './options';

@NgModule()
export class NgxsUndoPluginModule {
  static forRoot(config?: NgxsUndoPluginOptions): ModuleWithProviders {
    return {
      ngModule: NgxsUndoPluginModule,
      providers: [
        {
          provide: NGXS_PLUGINS,
          useClass: NgxsUndoPlugin,
          multi: true
        },
        {
          provide: NGXS_UNDO_PLUGIN_OPTIONS,
          useValue: config || { stackLimit: 5 }
        }
      ]
    };
  }
}
