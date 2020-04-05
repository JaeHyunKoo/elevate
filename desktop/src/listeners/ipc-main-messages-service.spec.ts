import { IpcMainMessagesService } from "./ipc-main-messages-service";
import { FlaggedIpcMessage, MessageFlag, RuntimeInfo } from "@elevate/shared/electron";
import { ActivityComputer, CompleteSyncEvent, ConnectorType, ErrorSyncEvent, FileSystemConnectorInfo, GenericSyncEvent, SyncEvent } from "@elevate/shared/sync";
import { StravaConnector } from "../connectors/strava/strava.connector";
import { Subject } from "rxjs";
import { FileSystemConnector } from "../connectors/filesystem/file-system.connector";
import { Service } from "../service";
import { ActivityStreamsModel, AnalysisDataModel, AthleteSettingsModel, AthleteSnapshotModel, Gender, SyncedActivityModel, UserSettings } from "@elevate/shared/models";
import * as _ from "lodash";
import { ElevateException } from "@elevate/shared/exceptions";
import DesktopUserSettingsModel = UserSettings.DesktopUserSettingsModel;

describe("IpcMainMessagesService", () => {

    let ipcMainMessagesService: IpcMainMessagesService;

    beforeEach(done => {

        const ipcMain = <Electron.IpcMain> {};
        const webContents = <Electron.WebContents> {};
        ipcMainMessagesService = new IpcMainMessagesService(ipcMain, webContents);
        ipcMainMessagesService.service = new Service(); // Ensure Service instance is new between tests

        done();
    });

    describe("Forward received messages from IpcRenderer", () => {

        it("should start sync when a MessageFlag.START_SYNC is received", done => {

            // Given
            const flaggedIpcMessage = new FlaggedIpcMessage(MessageFlag.START_SYNC,
                ConnectorType.STRAVA); // No need to provide extra payload to test forwardMessagesFromIpcRenderer
            const replyWith = () => {
            };

            const handleStartSyncSpy = spyOn(ipcMainMessagesService, "handleStartSync").and.stub();

            // When
            ipcMainMessagesService.forwardReceivedMessagesFromIpcRenderer(flaggedIpcMessage, replyWith);

            // Then
            expect(handleStartSyncSpy).toHaveBeenCalledTimes(1);
            done();
        });

        it("should link strava account when a MessageFlag.LINK_STRAVA_CONNECTOR is received", done => {

            // Given
            const flaggedIpcMessage = new FlaggedIpcMessage(MessageFlag.LINK_STRAVA_CONNECTOR,
                ConnectorType.STRAVA); // No need to provide extra payload to test forwardMessagesFromIpcRenderer
            const replyWith = () => {
            };

            const handleLinkWithStravaSpy = spyOn(ipcMainMessagesService, "handleLinkWithStrava").and.stub();

            // When
            ipcMainMessagesService.forwardReceivedMessagesFromIpcRenderer(flaggedIpcMessage, replyWith);

            // Then
            expect(handleLinkWithStravaSpy).toHaveBeenCalledTimes(1);
            done();
        });

        it("should stop sync when MessageFlag.CANCEL_SYNC is received", done => {

            // Given
            const flaggedIpcMessage = new FlaggedIpcMessage(MessageFlag.STOP_SYNC);
            const replyWith = () => {
            };

            const handleLinkWithStravaSpy = spyOn(ipcMainMessagesService, "handleStopSync").and.stub();

            // When
            ipcMainMessagesService.forwardReceivedMessagesFromIpcRenderer(flaggedIpcMessage, replyWith);

            // Then
            expect(handleLinkWithStravaSpy).toHaveBeenCalledTimes(1);
            done();
        });

        it("should provide when a MessageFlag.GET_RUNTIME_INFO is received", done => {

            // Given
            const runtimeInfo = new RuntimeInfo(null, null, null, null, null, null, null);
            const flaggedIpcMessage = new FlaggedIpcMessage(MessageFlag.GET_RUNTIME_INFO, runtimeInfo);
            const replyWith = () => {
            };

            const handleGetRuntimeInfoSpy = spyOn(ipcMainMessagesService, "handleGetRuntimeInfo").and.stub();

            // When
            ipcMainMessagesService.forwardReceivedMessagesFromIpcRenderer(flaggedIpcMessage, replyWith);

            // Then
            expect(handleGetRuntimeInfoSpy).toHaveBeenCalledTimes(1);
            done();
        });

        it("should compute activity when a MessageFlag.COMPUTE_ACTIVITY is received", done => {

            // Given
            const syncedActivityModel = new SyncedActivityModel();
            const athleteSnapshotModel = new AthleteSnapshotModel(Gender.MEN, AthleteSettingsModel.DEFAULT_MODEL);
            const userSettingsModel = new DesktopUserSettingsModel();
            const streams = new ActivityStreamsModel();
            const flaggedIpcMessage = new FlaggedIpcMessage(MessageFlag.COMPUTE_ACTIVITY, syncedActivityModel, athleteSnapshotModel, userSettingsModel, streams);
            const replyWith = () => {
            };

            const handleComputeActivitySpy = spyOn(ipcMainMessagesService, "handleComputeActivitySpy").and.stub();

            // When
            ipcMainMessagesService.forwardReceivedMessagesFromIpcRenderer(flaggedIpcMessage, replyWith);

            // Then
            expect(handleComputeActivitySpy).toHaveBeenCalledTimes(1);
            done();
        });

        it("should handle unknown MessageFlag received", done => {

            // Given
            const fakeFlag = -1;
            const flaggedIpcMessage = new FlaggedIpcMessage(fakeFlag);
            const replyWith = {
                callback: () => {
                },
                args: {
                    success: null,
                    error: "Unknown message received by IpcMain. FlaggedIpcMessage: " + JSON.stringify(flaggedIpcMessage)
                }
            };
            const replyWithCallbackSpy = spyOn(replyWith, "callback").and.stub();

            // When
            ipcMainMessagesService.forwardReceivedMessagesFromIpcRenderer(flaggedIpcMessage, replyWith.callback);

            // Then
            expect(replyWithCallbackSpy).toBeCalledWith(replyWith.args);
            done();
        });

    });

    describe("Handle start sync", () => {

        it("should start strava connector sync", done => {

            // Given
            const athleteModel = null;
            const stravaConnectorInfo = null;
            const userSettingsModel = null;
            const currentConnectorSyncDateTime = null;
            const flaggedIpcMessage = new FlaggedIpcMessage(MessageFlag.START_SYNC, ConnectorType.STRAVA,
                currentConnectorSyncDateTime, stravaConnectorInfo, athleteModel, userSettingsModel);
            const replyWith = {
                callback: () => {
                },
                args: {
                    success: "Started sync of connector " + ConnectorType.STRAVA,
                    error: null
                }
            };
            const stravaConnectorSyncCalls = 1;

            const stravaConnectorMock = StravaConnector.create(athleteModel, userSettingsModel, currentConnectorSyncDateTime, stravaConnectorInfo);
            const createStravaConnectorSpy = spyOn(StravaConnector, "create").and.returnValue(stravaConnectorMock);
            const stravaConnectorSyncSpy = spyOn(stravaConnectorMock, "sync").and.returnValue(new Subject<SyncEvent>());
            const replyWithCallbackSpy = spyOn(replyWith, "callback").and.stub();

            // When
            ipcMainMessagesService.handleStartSync(flaggedIpcMessage, replyWith.callback);

            // Then
            expect(createStravaConnectorSpy).toBeCalledTimes(1);
            expect(ipcMainMessagesService.service.currentConnector).not.toBeNull();
            expect(stravaConnectorSyncSpy).toBeCalledTimes(stravaConnectorSyncCalls);
            expect(replyWithCallbackSpy).toBeCalledWith(replyWith.args);

            done();
        });

        it("should start file system connector sync", done => {

            // Given
            const athleteModel = null;
            const userSettingsModel = null;
            const currentConnectorSyncDateTime = null;
            const expectedFileSystemConnectorInfo = new FileSystemConnectorInfo("/path/to/dir/");
            const flaggedIpcMessage = new FlaggedIpcMessage(MessageFlag.START_SYNC, ConnectorType.FILE_SYSTEM,
                currentConnectorSyncDateTime, expectedFileSystemConnectorInfo, athleteModel, userSettingsModel);
            const replyWith = {
                callback: () => {
                },
                args: {
                    success: "Started sync of connector " + ConnectorType.FILE_SYSTEM,
                    error: null
                }
            };
            const fsConnectorSyncCalls = 1;

            const fileSystemConnectorMock = FileSystemConnector.create(athleteModel, userSettingsModel, currentConnectorSyncDateTime,
                expectedFileSystemConnectorInfo.sourceDirectory, expectedFileSystemConnectorInfo.scanSubDirectories);
            const createFileSystemConnectorSpy = spyOn(FileSystemConnector, "create").and.returnValue(fileSystemConnectorMock);
            const fileSystemConnectorSyncSpy = spyOn(fileSystemConnectorMock, "sync").and.returnValue(new Subject<SyncEvent>());
            const replyWithCallbackSpy = spyOn(replyWith, "callback").and.stub();

            // When
            ipcMainMessagesService.handleStartSync(flaggedIpcMessage, replyWith.callback);

            // Then
            expect(createFileSystemConnectorSpy).toBeCalled();
            expect(ipcMainMessagesService.service.currentConnector).not.toBeNull();
            expect(fileSystemConnectorSyncSpy).toBeCalledTimes(fsConnectorSyncCalls);
            expect(replyWithCallbackSpy).toBeCalledWith(replyWith.args);

            done();
        });

        it("should not start a sync already running", done => {

            // Given
            ipcMainMessagesService.service.currentConnector = FileSystemConnector.create(null, null, null, null);
            ipcMainMessagesService.service.currentConnector.isSyncing = true;
            const syncSpy = spyOn(ipcMainMessagesService.service.currentConnector, "sync").and.stub();

            const replyWith = {
                callback: () => {
                },
                args: {
                    success: null,
                    error: "Impossible to start a new sync. Another sync is already running on connector " + ConnectorType.FILE_SYSTEM
                }
            };
            const replyWithCallbackSpy = spyOn(replyWith, "callback").and.stub();

            const flaggedIpcMessage = new FlaggedIpcMessage(MessageFlag.START_SYNC, ConnectorType.STRAVA, null, null, null, null);

            // When
            ipcMainMessagesService.handleStartSync(flaggedIpcMessage, replyWith.callback);

            // Then
            expect(ipcMainMessagesService.service.currentConnector).not.toBeNull();
            expect(replyWithCallbackSpy).toBeCalledWith(replyWith.args);
            expect(syncSpy).not.toBeCalled();

            done();
        });

        it("should send sync events (inc sync 'non-stop' errors) to IpcRenderer", done => {

            // Given
            const athleteModel = null;
            const stravaConnectorInfo = null;
            const userSettingsModel = null;
            const connectorSyncDateTime = null;
            const flaggedIpcMessage = new FlaggedIpcMessage(MessageFlag.START_SYNC, ConnectorType.STRAVA, athleteModel, userSettingsModel, stravaConnectorInfo);

            const syncEvent$ = new Subject<SyncEvent>();
            const fakeGenericSyncEvent = new GenericSyncEvent(ConnectorType.STRAVA, "Fake event");
            const expectedFlaggedMessageSent = new FlaggedIpcMessage(MessageFlag.SYNC_EVENT, fakeGenericSyncEvent);
            const replyWith = {
                callback: () => {
                },
                args: {
                    success: "Started sync of connector " + ConnectorType.STRAVA,
                    error: null
                }
            };
            const stravaConnectorSyncCalls = 1;
            const stravaConnectorMock = StravaConnector.create(athleteModel, userSettingsModel, connectorSyncDateTime, stravaConnectorInfo);
            const createStravaConnectorSpy = spyOn(StravaConnector, "create").and.returnValue(stravaConnectorMock);
            const stravaConnectorSyncSpy = spyOn(stravaConnectorMock, "sync").and.returnValue(syncEvent$);
            const sendMessageSpy = spyOn(ipcMainMessagesService, "send").and.returnValue(Promise.resolve("Message received by IpcMain"));
            const replyWithCallbackSpy = spyOn(replyWith, "callback").and.stub();

            // When
            ipcMainMessagesService.handleStartSync(flaggedIpcMessage, replyWith.callback);
            syncEvent$.next(fakeGenericSyncEvent);

            // Then
            expect(createStravaConnectorSpy).toBeCalled();
            expect(ipcMainMessagesService.service.currentConnector).not.toBeNull();
            expect(stravaConnectorSyncSpy).toBeCalledTimes(stravaConnectorSyncCalls);
            expect(replyWithCallbackSpy).toBeCalledWith(replyWith.args);
            expect(sendMessageSpy).toBeCalledWith(expectedFlaggedMessageSent);
            done();

        });

        it("should send error sync events raised (sync 'stop' errors) to IpcRenderer", done => {

            // Given
            const athleteModel = null;
            const stravaConnectorInfo = null;
            const userSettingsModel = null;
            const connectorSyncDateTime = null;
            const flaggedIpcMessage = new FlaggedIpcMessage(MessageFlag.START_SYNC, ConnectorType.STRAVA, athleteModel, userSettingsModel, stravaConnectorInfo);

            const syncEvent$ = new Subject<SyncEvent>();
            const fakeErrorSyncEvent = new ErrorSyncEvent(ConnectorType.STRAVA, {
                code: "fake_code",
                description: "fake_desc",
                stacktrace: "fake_stack"
            });
            const expectedFlaggedMessageSent = new FlaggedIpcMessage(MessageFlag.SYNC_EVENT, fakeErrorSyncEvent);
            const replyWith = {
                callback: () => {
                },
                args: {
                    success: "Started sync of connector " + ConnectorType.STRAVA,
                    error: null
                }
            };
            const stravaConnectorSyncCalls = 1;
            const stravaConnectorMock = StravaConnector.create(athleteModel, userSettingsModel, connectorSyncDateTime, stravaConnectorInfo);
            const createStravaConnectorSpy = spyOn(StravaConnector, "create").and.returnValue(stravaConnectorMock);
            const stravaConnectorSyncSpy = spyOn(stravaConnectorMock, "sync").and.returnValue(syncEvent$);
            const sendMessageSpy = spyOn(ipcMainMessagesService, "send").and.returnValue(Promise.resolve("Message received by IpcMain"));
            const replyWithCallbackSpy = spyOn(replyWith, "callback").and.stub();

            // When
            ipcMainMessagesService.handleStartSync(flaggedIpcMessage, replyWith.callback);
            syncEvent$.error(fakeErrorSyncEvent);

            // Then
            expect(createStravaConnectorSpy).toBeCalled();
            expect(stravaConnectorSyncSpy).toBeCalledTimes(stravaConnectorSyncCalls);
            expect(replyWithCallbackSpy).toBeCalledWith(replyWith.args);
            expect(sendMessageSpy).toBeCalledWith(expectedFlaggedMessageSent);

            syncEvent$.subscribe(() => {
                throw new Error("Test fail!");
            }, error => {
                expect(error).toEqual(fakeErrorSyncEvent);
                expect(ipcMainMessagesService.service.currentConnector).toBeNull();
                done();
            }, () => {
                throw new Error("Test fail!");
            });

        });

        it("should send complete sync events to IpcRenderer", done => {

            // Given
            const athleteModel = null;
            const updateSyncedActivitiesNameAndType = true;
            const stravaConnectorInfo = null;
            const connectorSyncDateTime = null;
            const userSettingsModel = null;
            const flaggedIpcMessage = new FlaggedIpcMessage(MessageFlag.START_SYNC, ConnectorType.STRAVA, athleteModel, userSettingsModel,
                stravaConnectorInfo, updateSyncedActivitiesNameAndType);

            const syncEvent$ = new Subject<SyncEvent>();
            const fakeCompleteSyncEvent = new CompleteSyncEvent(ConnectorType.STRAVA, "Sync done");
            const expectedFlaggedMessageSent = new FlaggedIpcMessage(MessageFlag.SYNC_EVENT, fakeCompleteSyncEvent);
            const replyWith = {
                callback: () => {
                },
                args: {
                    success: "Started sync of connector " + ConnectorType.STRAVA,
                    error: null
                }
            };
            const stravaConnectorSyncCalls = 1;
            const stravaConnectorMock = StravaConnector.create(athleteModel, userSettingsModel, connectorSyncDateTime, stravaConnectorInfo);
            const createStravaConnectorSpy = spyOn(StravaConnector, "create").and.returnValue(stravaConnectorMock);
            const stravaConnectorSyncSpy = spyOn(stravaConnectorMock, "sync").and.returnValue(syncEvent$);
            const sendMessageSpy = spyOn(ipcMainMessagesService, "send").and.returnValue(Promise.resolve("Message received by IpcMain"));
            const replyWithCallbackSpy = spyOn(replyWith, "callback").and.stub();

            // When
            ipcMainMessagesService.handleStartSync(flaggedIpcMessage, replyWith.callback);
            syncEvent$.complete();

            // Then
            expect(createStravaConnectorSpy).toBeCalled();
            expect(stravaConnectorSyncSpy).toBeCalledTimes(stravaConnectorSyncCalls);
            expect(replyWithCallbackSpy).toBeCalledWith(replyWith.args);
            expect(sendMessageSpy).toBeCalledWith(expectedFlaggedMessageSent);

            syncEvent$.subscribe(() => {
                throw new Error("Test fail!");
            }, () => {
                throw new Error("Test fail!");
            }, () => {
                expect(ipcMainMessagesService.service.currentConnector).toBeNull();
                done();
            });

        });

    });

    describe("Handle sync stop", () => {

        it("should stop current sync", done => {

            // Given
            const flaggedIpcMessage = new FlaggedIpcMessage(MessageFlag.STOP_SYNC, ConnectorType.STRAVA);
            const replyWith = () => {
            };
            const connector = StravaConnector.create(null, null, null, null);
            jest.spyOn(ipcMainMessagesService.service, "currentConnector", "get").mockReturnValue(connector);
            const stopConnectorSyncSpy = spyOn(connector, "stop").and.returnValue(Promise.resolve());

            // When
            ipcMainMessagesService.handleStopSync(flaggedIpcMessage, replyWith);

            // Then
            expect(stopConnectorSyncSpy).toBeCalledTimes(1);
            done();
        });

        it("should not stop sync if no connector is mapped to service", done => {

            // Given
            const flaggedIpcMessage = new FlaggedIpcMessage(MessageFlag.STOP_SYNC, ConnectorType.STRAVA);
            const replyWith = {
                callback: () => {
                },
                args: {
                    success: null,
                    error: "No existing connector found to stop sync"
                }
            };

            const connector = StravaConnector.create(null, null, null, null);
            jest.spyOn(ipcMainMessagesService.service, "currentConnector", "get").mockReturnValue(null);
            const stopConnectorSyncSpy = spyOn(connector, "stop").and.stub();
            const replyWithCallbackSpy = spyOn(replyWith, "callback").and.stub();

            // When
            ipcMainMessagesService.handleStopSync(flaggedIpcMessage, replyWith.callback);

            // Then
            expect(stopConnectorSyncSpy).not.toBeCalled();
            expect(replyWithCallbackSpy).toBeCalledWith(replyWith.args);

            done();
        });

        it("should not stop sync of a given connector if current connector syncing has different type", done => {

            // Given
            const requestConnectorType = ConnectorType.STRAVA;
            const flaggedIpcMessage = new FlaggedIpcMessage(MessageFlag.STOP_SYNC, requestConnectorType);
            const replyWith = {
                callback: () => {
                },
                args: {
                    success: null,
                    error: `Trying to stop a sync on ${requestConnectorType} connector but current connector synced type is: ${ConnectorType.FILE_SYSTEM}`
                }
            };

            const connector = FileSystemConnector.create(null, null, null, null);
            jest.spyOn(ipcMainMessagesService.service, "currentConnector", "get").mockReturnValue(connector);
            const stopConnectorSyncSpy = spyOn(connector, "stop").and.stub();
            const replyWithCallbackSpy = spyOn(replyWith, "callback").and.stub();

            // When
            ipcMainMessagesService.handleStopSync(flaggedIpcMessage, replyWith.callback);

            // Then
            expect(stopConnectorSyncSpy).not.toBeCalled();
            expect(replyWithCallbackSpy).toBeCalledWith(replyWith.args);

            done();
        });

    });

    describe("Handle compute activity (case: fix activities, recompute single activity)", () => {

        it("should compute activity", done => {

            // Given
            const syncedActivityModel = new SyncedActivityModel();
            syncedActivityModel.name = "My activity";
            syncedActivityModel.start_time = new Date().toISOString();
            const athleteSnapshotModel = new AthleteSnapshotModel(Gender.MEN, AthleteSettingsModel.DEFAULT_MODEL);
            const streams = new ActivityStreamsModel();
            const flaggedIpcMessage = new FlaggedIpcMessage(MessageFlag.COMPUTE_ACTIVITY, syncedActivityModel, athleteSnapshotModel, streams);
            const analysisDataModel = new AnalysisDataModel();
            const expectedSyncedActivityModel = _.cloneDeep(syncedActivityModel);
            expectedSyncedActivityModel.extendedStats = analysisDataModel;
            expectedSyncedActivityModel.athleteSnapshot = athleteSnapshotModel;
            const replyWrapper = {
                replyWith: () => {
                }
            };

            const calculateSpy = spyOn(ActivityComputer, "calculate").and.returnValue(analysisDataModel);
            const replyWithSpy = spyOn(replyWrapper, "replyWith");

            // When
            ipcMainMessagesService.handleComputeActivitySpy(flaggedIpcMessage, replyWrapper.replyWith);

            // Then
            expect(calculateSpy).toBeCalledTimes(1);
            expect(replyWithSpy).toBeCalledWith({success: jasmine.any(SyncedActivityModel), error: null});
            done();
        });

        it("should reject compute activity", done => {

            // Given
            const syncedActivityModel = new SyncedActivityModel();
            syncedActivityModel.name = "My activity";
            syncedActivityModel.start_time = new Date().toISOString();
            const athleteSnapshotModel = new AthleteSnapshotModel(Gender.MEN, AthleteSettingsModel.DEFAULT_MODEL);
            const streams = new ActivityStreamsModel();
            const flaggedIpcMessage = new FlaggedIpcMessage(MessageFlag.COMPUTE_ACTIVITY, syncedActivityModel, athleteSnapshotModel, streams);
            const analysisDataModel = new AnalysisDataModel();
            const expectedSyncedActivityModel = _.cloneDeep(syncedActivityModel);
            expectedSyncedActivityModel.extendedStats = analysisDataModel;
            expectedSyncedActivityModel.athleteSnapshot = athleteSnapshotModel;
            const expectedErrorMessage = `unable to calculate activity ${syncedActivityModel.name} started at ${syncedActivityModel.start_timestamp}: Whoops.`;
            const expectedElevateException = new ElevateException(expectedErrorMessage);
            const replyWrapper = {
                replyWith: () => {
                }
            };

            const calculateSpy = spyOn(ActivityComputer, "calculate").and.callFake(() => {
                throw expectedElevateException;
            });
            const replyWithSpy = spyOn(replyWrapper, "replyWith");

            // When
            ipcMainMessagesService.handleComputeActivitySpy(flaggedIpcMessage, replyWrapper.replyWith);

            // Then
            expect(calculateSpy).toBeCalledTimes(1);
            expect(replyWithSpy).toBeCalledWith({success: null, error: expectedElevateException});
            done();
        });
    });

    describe("Handle get machine id", () => {

        it("should get runtime info", done => {

            // Given
            const replyWrapper = {
                replyWith: () => {
                }
            };
            const fakeRuntimeInfo = new RuntimeInfo(null, null, null, null, null, null, null);
            const flaggedIpcMessage = new FlaggedIpcMessage(MessageFlag.GET_RUNTIME_INFO, fakeRuntimeInfo);
            jest.spyOn(Service.instance(), "getRuntimeInfo").mockReturnValue(fakeRuntimeInfo);
            const replyWithSpy = jest.spyOn(replyWrapper, "replyWith");

            // When
            ipcMainMessagesService.handleGetRuntimeInfo(flaggedIpcMessage, replyWrapper.replyWith);

            // Then
            expect(replyWithSpy).toBeCalledWith({success: fakeRuntimeInfo, error: null});
            done();
        });

    });
});
