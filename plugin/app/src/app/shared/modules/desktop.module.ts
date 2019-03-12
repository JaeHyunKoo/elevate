import { NgModule } from "@angular/core";
import { DataStore } from "../data-store/data-store";
import { AppEventsService } from "../services/external-updates/app-events-service";
import { DesktopEventsService } from "../services/external-updates/impl/desktop-events.service";
import { DesktopDataStore } from "../data-store/impl/desktop-data-store.service";
import { VERSIONS_PROVIDER } from "../services/versions/versions-provider.interface";
import { DesktopVersionsProvider } from "../services/versions/impl/desktop-versions-provider.service";

@NgModule({
	providers: [
		{provide: DataStore, useClass: DesktopDataStore},
		{provide: AppEventsService, useClass: DesktopEventsService},
		{provide: VERSIONS_PROVIDER, useClass: DesktopVersionsProvider}
	]
})
export class DesktopModule {
}
