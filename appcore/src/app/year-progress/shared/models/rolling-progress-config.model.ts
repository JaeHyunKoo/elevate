import { ProgressMode } from "../enums/progress-mode.enum";
import { YearToDateProgressConfigModel } from "./year-to-date-progress-config.model";
import { ProgressConfig } from "../interfaces/progress-config";
import { ElevateSport } from "@elevate/shared/enums";

export class RollingProgressConfigModel extends YearToDateProgressConfigModel {

	constructor(typesFilter: ElevateSport[], includeCommuteRide: boolean,
				includeIndoorRide: boolean, rollingDays: number) {
		super(typesFilter, includeCommuteRide, includeIndoorRide);
		this.rollingDays = rollingDays;
	}

	public readonly mode = ProgressMode.ROLLING; // Overrides mode

	public readonly rollingDays: number;

	public static instanceFrom(progressConfig: ProgressConfig): RollingProgressConfigModel {

		if (progressConfig.mode !== ProgressMode.ROLLING) {
			throw new Error("progressConfig.mode !== ProgressMode.ROLLING");
		}

		return new RollingProgressConfigModel(progressConfig.activityTypes, progressConfig.includeCommuteRide,
			progressConfig.includeIndoorRide, (<RollingProgressConfigModel> progressConfig).rollingDays);
	}
}
