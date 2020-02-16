import { ChangeDetectorRef, Component, HostBinding, InjectionToken, OnInit } from "@angular/core";
import { DesktopSyncService } from "../shared/services/sync/impl/desktop-sync.service";
import { ActivitySyncEvent, SyncEvent, SyncEventType } from "@elevate/shared/sync";
import { SyncException } from "@elevate/shared/exceptions";
import * as moment from "moment";

export const SYNC_BAR_COMPONENT_TOKEN = new InjectionToken<SyncBarComponent>("SYNC_BAR_COMPONENT_TOKEN");

@Component({template: ""})
export class SyncBarComponent {
}

@Component({
	selector: "app-desktop-sync-bar",
	template: `
		<div class="app-sync-bar">
			<div fxLayout="row" fxLayoutAlign="space-between center">
				<div>
					<span class="mat-body-1" *ngIf="currentSyncEventText">{{currentSyncEventText}}</span>
				</div>
				<div fxLayout="row" fxLayoutAlign="space-between center">
					<button mat-flat-button color="warn" (click)="onStop()">
						Stop
					</button>
				</div>
			</div>
		</div>
	`,
	styles: [`

		.app-sync-bar {
			padding: 10px 20px;
		}

		button {
			margin-left: 10px;
		}
	`]
})
export class DesktopSyncBarComponent extends SyncBarComponent implements OnInit {

	@HostBinding("hidden")
	public hideSyncBar: boolean;

	public isStopped: boolean;
	public isSyncCompleted: boolean;

	public currentSyncEventText: string;

	constructor(public desktopSyncService: DesktopSyncService,
				public changeDetectorRef: ChangeDetectorRef) {
		super();
		this.hideSyncBar = true;
		this.isStopped = false;
		this.isSyncCompleted = false;
		this.currentSyncEventText = null;
	}

	public ngOnInit(): void {

		this.desktopSyncService.syncEvents$.subscribe((syncEvent: SyncEvent) => {
			this.handleSyncEventDisplay(syncEvent);
		});
	}

	public handleSyncEventDisplay(syncEvent: SyncEvent) {

		this.changeDetectorRef.markForCheck();

		if (syncEvent.type === SyncEventType.STARTED) {
			this.hideSyncBar = false;
			this.isStopped = false;
			this.isSyncCompleted = false;
			this.currentSyncEventText = "Sync started on connector \"" + syncEvent.fromConnectorType.toLowerCase() + "\"";
		}

		if (this.isStopped) {
			return;
		}

		if (syncEvent.type === SyncEventType.GENERIC) {
			this.currentSyncEventText = syncEvent.description;
		}

		if (syncEvent.type === SyncEventType.ACTIVITY) {
			const activitySyncEvent = <ActivitySyncEvent> syncEvent;
			this.currentSyncEventText = moment(activitySyncEvent.activity.start_time).format("ll") + ": " + activitySyncEvent.activity.name;
		}

		if (syncEvent.type === SyncEventType.ERROR) {
			const message = JSON.stringify(syncEvent);
			this.currentSyncEventText = message;
		}

		if (syncEvent.type === SyncEventType.STOPPED) {
			this.isStopped = true;
			this.currentSyncEventText = "Sync stopped on connector \"" + syncEvent.fromConnectorType.toLowerCase() + "\"";
			this.hideSyncBar = true;
		}

		if (syncEvent.type === SyncEventType.COMPLETE) {
			this.isSyncCompleted = true;
			this.currentSyncEventText = "Sync completed on connector \"" + syncEvent.fromConnectorType.toLowerCase() + "\"";
			this.hideSyncBar = true;
		}

		this.changeDetectorRef.detectChanges();
	}

	public onStop(): Promise<void> {
		return this.desktopSyncService.stop().catch(error => {
			throw new SyncException(error); // Should be caught by Error Handler
		});
	}

}

@Component({
	selector: "app-extension-sync-bar",
	template: ``,
	styles: [``]
})
export class ExtensionSyncBarComponent extends SyncBarComponent implements OnInit {

	constructor() {
		super();
	}

	public ngOnInit(): void {
	}
}
