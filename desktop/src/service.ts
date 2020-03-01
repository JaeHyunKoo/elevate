import { IpcMainMessagesService } from "./listeners/ipc-main-messages-service";
import { BaseConnector } from "./connectors/base.connector";
import { HttpClient } from "typed-rest-client/HttpClient";
import * as os from "os";
import { machineIdSync } from "node-machine-id";
import { RuntimeInfo } from "@elevate/shared/electron";
import * as crypto from "crypto";
import { app } from "electron";
import * as path from "path";

export class Service {

	constructor() {
		this._ipcMainMessages = null;
		this._httpProxy = null;
		this._currentConnector = null;
		this._machineId = null;
		this._runtimeInfo = null;
	}

	get ipcMainMessages(): IpcMainMessagesService {
		return this._ipcMainMessages;
	}

	set ipcMainMessages(value: IpcMainMessagesService) {
		this._ipcMainMessages = value;
	}

	get httpClient(): HttpClient {
		return this._httpClient;
	}

	set httpClient(value: HttpClient) {
		this._httpClient = value;
	}

	get currentConnector(): BaseConnector {
		return this._currentConnector;
	}

	set currentConnector(value: BaseConnector) {
		this._currentConnector = value; // TODO Test if currentConnector is in syncing before set anything!!
	}

	get isPackaged(): boolean {
		return this._isPackaged;
	}

	set isPackaged(value: boolean) {
		this._isPackaged = value;
	}

	private static _instance: Service = null;

	public static readonly PLATFORM = {
		WINDOWS: "win32",
		LINUX: "linux",
		MACOS: "darwin",
	};

	private _ipcMainMessages: IpcMainMessagesService;
	private _httpProxy: string;
	private _httpClient: HttpClient;
	private _currentConnector: BaseConnector;
	private _machineId: string;
	private _runtimeInfo: RuntimeInfo;
	private _isPackaged: boolean;

	public static instance(): Service {
		if (!Service._instance) {
			Service._instance = new Service();
		}
		return Service._instance;
	}

	public getResourceFolder(): string {
		return path.dirname(app.getAppPath());
	}

	public isWindows(): boolean {
		return this.getRuntimeInfo().osPlatform.name === Service.PLATFORM.WINDOWS;
	}

	public isLinux(): boolean {
		return this.getRuntimeInfo().osPlatform.name === Service.PLATFORM.LINUX;
	}

	public isMacOS(): boolean {
		return this.getRuntimeInfo().osPlatform.name === Service.PLATFORM.MACOS;
	}

	public getRuntimeInfo(): RuntimeInfo {

		if (!this._runtimeInfo) {
			const osPlatform = {name: os.platform(), arch: os.arch()};
			const osHostname = os.hostname().trim();
			const osUsername = os.userInfo().username.trim();
			const osMachineId = machineIdSync();
			const athleteMachineId = crypto.createHash("sha1").update(osMachineId + ":" + osUsername).digest("hex");
			const cpuName = {name: os.cpus()[0].model.trim(), threads: os.cpus().length};
			const memorySize = Math.round(((os.totalmem() / 1024) / 1024) / 1024);
			this._runtimeInfo = new RuntimeInfo(osPlatform, osHostname, osUsername, osMachineId, athleteMachineId, cpuName, memorySize);
		}
		return this._runtimeInfo;
	}

	public printRuntimeInfo(): string {
		const runtimeInfo = this.getRuntimeInfo();
		return `Hostname ${runtimeInfo.osHostname}; Platform ${runtimeInfo.osPlatform.name} ${runtimeInfo.osPlatform.arch}; Cpu ${runtimeInfo.cpu.name}; Memory ${runtimeInfo.memorySizeGb}GB; athleteMachineId ${runtimeInfo.athleteMachineId}; Node v${process.versions.node}`;
	}
}
