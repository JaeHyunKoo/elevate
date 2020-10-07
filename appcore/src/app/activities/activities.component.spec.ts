import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ActivitiesComponent } from "./activities.component";
import { CoreModule } from "../core/core.module";
import { SharedModule } from "../shared/shared.module";
import { ActivityService } from "../shared/services/activity/activity.service";
import { UserSettingsService } from "../shared/services/user-settings/user-settings.service";
import * as _ from "lodash";
import { TEST_SYNCED_ACTIVITIES } from "../../shared-fixtures/activities-2015.fixture";
import { ExtensionEventsService } from "../shared/services/external-updates/impl/extension-events.service";
import { SyncState } from "../shared/services/sync/sync-state.enum";
import { UserSettings } from "@elevate/shared/models";
import { SyncService } from "../shared/services/sync/sync.service";
import { DataStore } from "../shared/data-store/data-store";
import { TestingDataStore } from "../shared/data-store/testing-datastore.service";
import DesktopUserSettingsModel = UserSettings.DesktopUserSettingsModel;

describe("ActivitiesComponent", () => {
  const pluginId = "c061d18abea0";
  let activityService: ActivityService = null;
  let userSettingsService: UserSettingsService = null;
  let syncService: SyncService<any>;

  let component: ActivitiesComponent;
  let fixture: ComponentFixture<ActivitiesComponent>;

  beforeEach(done => {
    TestBed.configureTestingModule({
      imports: [CoreModule, SharedModule],
      providers: [{ provide: DataStore, useClass: TestingDataStore }],
    }).compileComponents();

    spyOn(ExtensionEventsService, "getBrowserExternalMessages").and.returnValue({
      // @ts-ignore
      addListener: (message: any, sender: any, sendResponse: any) => {},
    });

    spyOn(ExtensionEventsService, "getBrowserPluginId").and.returnValue(pluginId);

    activityService = TestBed.inject(ActivityService);
    userSettingsService = TestBed.inject(UserSettingsService);
    syncService = TestBed.inject(SyncService);

    // Mocking
    spyOn(activityService, "findSortStartDate").and.returnValue(Promise.resolve(_.cloneDeep(TEST_SYNCED_ACTIVITIES)));
    spyOn(userSettingsService, "fetch").and.returnValue(
      Promise.resolve(_.cloneDeep(DesktopUserSettingsModel.DEFAULT_MODEL))
    );

    spyOn(syncService, "getSyncDateTime").and.returnValue(Promise.resolve(Date.now()));
    spyOn(syncService, "getSyncState").and.returnValue(Promise.resolve(SyncState.SYNCED));

    done();
  });

  beforeEach(done => {
    fixture = TestBed.createComponent(ActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    done();
  });

  it("should create", done => {
    expect(component).toBeTruthy();
    done();
  });
});
