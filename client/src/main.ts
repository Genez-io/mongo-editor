import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from './environments/environment'; // Import environment
import { AppModule } from './app/app.module';

if (environment.production) {
  enableProdMode();
}

if (module['hot']) {
  module['hot'].accept();
  module['hot'].dispose(() => {
    const appRef = module['hot'].data.appRef;
    if (appRef) {
      appRef.destroy();
    }
  });
}


platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
