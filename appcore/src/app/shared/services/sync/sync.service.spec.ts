import { TestBed } from "@angular/core/testing";
import { SyncDateTimeDao } from "../../dao/sync/sync-date-time-dao.service";
import { AthleteModel } from "@elevate/shared/models";
import { CoreModule } from "../../../core/core.module";
import { SharedModule } from "../../shared.module";
import * as _ from "lodash";
import { VERSIONS_PROVIDER } from "../versions/versions-provider.interface";
import { MockedVersionsProvider } from "../versions/impl/mock/mocked-versions-provider";
import { SyncService } from "./sync.service";
import { MockSyncService } from "./impl/mock/mock-sync.service";

describe("SyncService", () => {

	let athleteModel: AthleteModel;
	let syncService: SyncService<any>;
	let syncDateTimeDao: SyncDateTimeDao;

	beforeEach((done: Function) => {

		const mockedVersionsProvider: MockedVersionsProvider = new MockedVersionsProvider();

		TestBed.configureTestingModule({
			imports: [
				CoreModule,
				SharedModule,
			],
			providers: [
				{provide: SyncService, useClass: MockSyncService},
				{provide: VERSIONS_PROVIDER, useValue: mockedVersionsProvider}
			]
		});

		athleteModel = _.cloneDeep(AthleteModel.DEFAULT_MODEL);

		syncService = TestBed.inject(SyncService);
		syncDateTimeDao = TestBed.inject(SyncDateTimeDao);

		spyOn(window, "open").and.stub(); // Avoid opening window in tests

		done();

	});

	it("should be created", (done: Function) => {
		expect(syncService).toBeTruthy();
		done();
	});

});
